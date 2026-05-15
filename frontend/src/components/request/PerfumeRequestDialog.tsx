import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, Sparkles, Upload, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";
import { perfumeRequestsApi } from "@/services/api";
import { useNotification } from "@/context/NotificationContext";

const SIZE_OPTIONS = ["3ml", "6ml", "12ml", "30ml", "50ml", "100ml", "Other"] as const;
const BUDGET_OPTIONS = [
  "Under ₹500",
  "₹500 - ₹1000",
  "₹1000 - ₹2000",
  "₹2000+",
  "Not sure",
] as const;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type FormState = {
  perfumeName: string;
  customerName: string;
  phoneNumber: string;
  preferredSize: string;
  budgetRange: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormState | "images" | "submit", string>>;

const createEmptyForm = (): FormState => ({
  perfumeName: "",
  customerName: "",
  phoneNumber: "",
  preferredSize: "",
  budgetRange: "",
  message: "",
});

const fieldCls =
  "w-full rounded-2xl border border-navy/10 bg-white/85 px-4 py-3.5 text-sm text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] outline-none transition placeholder:text-navy/40 focus:border-gold focus:ring-2 focus:ring-gold/20";

const normalizePhone = (value: string) => value.trim().replace(/[\s()-]/g, "");
const isValidIndianPhone = (value: string) =>
  /^(?:\+91|91)?[6-9]\d{9}$/.test(normalizePhone(value));

export function PerfumeRequestDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addNotification } = useNotification();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<FormState>(createEmptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Array<{ name: string; url: string }>>([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const nextPreviews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow || "auto";
    };
  }, [open]);

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, submit: undefined }));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setErrors({});
    setFiles([]);
    setDragging(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};

    if (!form.perfumeName.trim()) {
      nextErrors.perfumeName = "Perfume or brand name is required.";
    }

    if (!form.customerName.trim()) {
      nextErrors.customerName = "Customer name is required.";
    }

    if (!form.phoneNumber.trim()) {
      nextErrors.phoneNumber = "Phone number is required.";
    } else if (!isValidIndianPhone(form.phoneNumber)) {
      nextErrors.phoneNumber = "Enter a valid Indian mobile number.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Please share a few details about the fragrance you want.";
    }

    if (files.length > MAX_FILES) {
      nextErrors.images = "You can add up to 3 images.";
    }

    return nextErrors;
  };

  const handleFiles = (incomingFiles: FileList | File[]) => {
    const selectedFiles = Array.from(incomingFiles || []);
    if (!selectedFiles.length) return;

    const nextErrors: FieldErrors = {};

    if (files.length + selectedFiles.length > MAX_FILES) {
      nextErrors.images = "You can add up to 3 images. Remove one to add another.";
      setErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }

    const invalidTypeFile = selectedFiles.find((file) => !ALLOWED_IMAGE_TYPES.has(file.type));
    if (invalidTypeFile) {
      nextErrors.images = "Only JPG, PNG, and WEBP images are allowed.";
      setErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }

    const oversizeFile = selectedFiles.find((file) => file.size > MAX_FILE_SIZE);
    if (oversizeFile) {
      nextErrors.images = "Each image must be 5MB or smaller.";
      setErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }

    setFiles((current) => [...current, ...selectedFiles]);
    setErrors((current) => ({ ...current, images: undefined, submit: undefined }));
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setErrors((current) => ({ ...current, images: undefined }));
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const payload = new FormData();
      payload.append("perfumeName", form.perfumeName.trim());
      payload.append("customerName", form.customerName.trim());
      payload.append("phoneNumber", form.phoneNumber.trim());
      payload.append("message", form.message.trim());

      if (form.preferredSize) {
        payload.append("preferredSize", form.preferredSize);
      }

      if (form.budgetRange) {
        payload.append("budgetRange", form.budgetRange);
      }

      files.forEach((file) => payload.append("images", file));

      await perfumeRequestsApi.create(payload);
      addNotification("Perfume request sent successfully. We'll get back to you soon.");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Perfume request could not be submitted.";
      setErrors({ submit: message });
      addNotification(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setDragging(false);
        setErrors((current) => ({ ...current, submit: undefined }));
        onOpenChange(nextOpen);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[120] bg-[#071427]/72 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[121] flex max-h-[90vh] w-[95%] max-w-[46rem] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.85rem] border border-beige/10 bg-[linear-gradient(180deg,rgba(253,249,245,0.98),rgba(245,237,228,0.97))] text-navy shadow-[0_34px_90px_-36px_rgba(0,0,0,0.62)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 md:border-beige/20",
          )}
        >
          <div className="border-b border-navy/10 bg-[linear-gradient(135deg,rgba(7,32,63,0.98),rgba(11,38,74,0.94))] px-5 py-5 text-beige md:px-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-gold">
                  <Sparkles className="h-3.5 w-3.5" />
                  Personal Sourcing
                </div>
                <DialogPrimitive.Title className="font-display text-3xl text-beige md:text-[2.35rem]">
                  Request a Perfume
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-2 max-w-2xl text-sm leading-7 text-beige/72">
                  Share the fragrance name, your preferred size, and any reference photos. We'll try
                  to source it for you.
                </DialogPrimitive.Description>
              </div>

              <DialogPrimitive.Close className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-beige/15 bg-beige/8 text-beige/75 transition hover:border-gold/35 hover:text-gold">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 max-h-[calc(90vh-120px)] flex-1 overflow-y-auto px-5 py-5 scroll-smooth md:px-7 md:py-6">
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-navy/60">
                      Perfume Name / Brand Name
                    </span>
                    <input
                      value={form.perfumeName}
                      onChange={(event) => updateField("perfumeName", event.target.value)}
                      placeholder="Example: Belovita, Dior Sauvage, Afnan 9PM"
                      className={fieldCls}
                    />
                    {errors.perfumeName ? (
                      <p className="mt-2 text-sm text-red-600">{errors.perfumeName}</p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-navy/60">
                      Customer Name
                    </span>
                    <input
                      value={form.customerName}
                      onChange={(event) => updateField("customerName", event.target.value)}
                      placeholder="Your full name"
                      className={fieldCls}
                    />
                    {errors.customerName ? (
                      <p className="mt-2 text-sm text-red-600">{errors.customerName}</p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-navy/60">
                      Phone Number
                    </span>
                    <input
                      value={form.phoneNumber}
                      onChange={(event) => updateField("phoneNumber", event.target.value)}
                      placeholder="+91 98765 43210"
                      className={fieldCls}
                      inputMode="tel"
                    />
                    {errors.phoneNumber ? (
                      <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-navy/60">
                      Preferred Size
                    </span>
                    <select
                      value={form.preferredSize}
                      onChange={(event) => updateField("preferredSize", event.target.value)}
                      className={fieldCls}
                    >
                      <option value="">Select size</option>
                      {SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-navy/60">
                      Budget Range
                    </span>
                    <select
                      value={form.budgetRange}
                      onChange={(event) => updateField("budgetRange", event.target.value)}
                      className={fieldCls}
                    >
                      <option value="">Select budget range</option>
                      {BUDGET_OPTIONS.map((budget) => (
                        <option key={budget} value={budget}>
                          {budget}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-navy/60">
                    Message / Notes
                  </span>
                  <textarea
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    placeholder="Tell us size, concentration, budget, or any details..."
                    rows={5}
                    className={`${fieldCls} resize-none`}
                  />
                  {errors.message ? (
                    <p className="mt-2 text-sm text-red-600">{errors.message}</p>
                  ) : null}
                </label>

                <div className="space-y-3">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.22em] text-navy/60">
                      Upload perfume photos
                    </p>
                    <p className="mt-1 text-sm text-navy/55">You can add up to 3 images</p>
                  </div>

                  <label
                    className={cn(
                      "group flex cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed px-5 py-7 text-center transition duration-300 ease-out",
                      dragging
                        ? "border-gold bg-gold/8 shadow-[0_18px_40px_-28px_rgba(200,169,106,0.72)]"
                        : "border-navy/18 bg-white/72 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-[0_18px_40px_-28px_rgba(7,32,63,0.28)]",
                    )}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      setDragging(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      handleFiles(event.dataTransfer.files);
                    }}
                  >
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gold/22 bg-gold/10 text-gold transition group-hover:scale-105">
                      <Upload className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-navy">
                      Drag photos here or tap to choose from your gallery
                    </span>
                    <span className="mt-1 text-xs uppercase tracking-[0.18em] text-navy/45">
                      JPG, PNG, WEBP · Max 5MB each
                    </span>
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={(event) => handleFiles(event.target.files || [])}
                    />
                  </label>

                  {errors.images ? <p className="text-sm text-red-600">{errors.images}</p> : null}

                  {previews.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {previews.map((preview, index) => (
                        <div
                          key={`${preview.name}-${index}`}
                          className="group relative overflow-hidden rounded-[1.2rem] border border-navy/10 bg-white shadow-soft"
                        >
                          <img
                            src={preview.url}
                            alt={`Perfume reference ${index + 1}`}
                            className="aspect-square h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-navy/78 text-beige shadow-lg transition hover:bg-[#0d2b53]"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-navy/10 bg-[linear-gradient(180deg,rgba(253,249,245,0.98),rgba(245,237,228,0.97))] px-5 py-4 md:px-7">
              {errors.submit ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.submit}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-navy/55">
                  We usually reply after checking availability.
                </p>
                <Button
                  type="submit"
                  variant="gold"
                  disabled={submitting}
                  className="w-full rounded-full px-7 py-3.5 text-[0.72rem] tracking-[0.28em] hover:-translate-y-0.5 hover:shadow-[0_22px_46px_-24px_rgba(200,169,106,0.9)] sm:w-auto"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
