import { r as reactExports, j as jsxRuntimeExports, a0 as Sparkles, X, au as Upload, aD as LoaderCircle, O as ArrowRight } from "./vendor-react-98xxEzFV.js";
import { a as useNotification, K as cn, B as Button, W as perfumeRequestsApi, C as Container } from "./router-DvCKRw9U.js";
import { a as Root, P as Portal, O as Overlay, b as Content, d as Title, D as Description, c as Close } from "./vendor-radix-xsh1HthL.js";
import { m as motion } from "./vendor-motion-3kNaalGV.js";
import "./vendor-tanstack-DkD25YnA.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "util";
import "stream";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "crypto";
import "assert";
import "./worker-entry-8w9vAzi1.js";
import "node:events";
import "os";
import "zlib";
import "events";
import "./vendor-charts-Ot63D9Dz.js";
const SIZE_OPTIONS = ["3ml", "6ml", "12ml", "30ml", "50ml", "100ml", "Other"];
const ALLOWED_IMAGE_TYPES = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DISPLAY_BUDGET_OPTIONS = [
  "Under ₹500",
  "₹500 - ₹1000",
  "₹1000 - ₹2000",
  "₹2000+",
  "Not sure"
];
const createEmptyForm = () => ({
  perfumeName: "",
  customerName: "",
  phoneNumber: "",
  preferredSize: "",
  budgetRange: "",
  message: ""
});
const fieldCls = "w-full rounded-2xl border border-navy/10 bg-white/85 px-4 py-3.5 text-sm text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] outline-none transition placeholder:text-navy/40 focus:border-gold focus:ring-2 focus:ring-gold/20";
const normalizePhone = (value) => value.trim().replace(/[\s()-]/g, "");
const isValidIndianPhone = (value) => /^(?:\+91|91)?[6-9]\d{9}$/.test(normalizePhone(value));
function PerfumeRequestDialog({
  open,
  onOpenChange
}) {
  const { addNotification } = useNotification();
  const inputRef = reactExports.useRef(null);
  const [form, setForm] = reactExports.useState(createEmptyForm);
  const [errors, setErrors] = reactExports.useState({});
  const [files, setFiles] = reactExports.useState([]);
  const [previews, setPreviews] = reactExports.useState([]);
  const [dragging, setDragging] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const nextPreviews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    setPreviews(nextPreviews);
    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);
  reactExports.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow || "auto";
    };
  }, [open]);
  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: void 0, submit: void 0 }));
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
    const nextErrors = {};
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
  const handleFiles = (incomingFiles) => {
    const selectedFiles = Array.from(incomingFiles || []);
    if (!selectedFiles.length) return;
    const nextErrors = {};
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
    setErrors((current) => ({ ...current, images: void 0, submit: void 0 }));
  };
  const removeFile = (index) => {
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setErrors((current) => ({ ...current, images: void 0 }));
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };
  const onSubmit = async (event) => {
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
      const message = error instanceof Error ? error.message : "Perfume request could not be submitted.";
      setErrors({ submit: message });
      addNotification(message, "error");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root,
    {
      open,
      onOpenChange: (nextOpen) => {
        setDragging(false);
        setErrors((current) => ({ ...current, submit: void 0 }));
        onOpenChange(nextOpen);
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Portal, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, { className: "fixed inset-0 z-[120] bg-[#071427]/72 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Content,
          {
            className: cn(
              "fixed left-1/2 top-1/2 z-[121] flex max-h-[90vh] w-[95%] max-w-[46rem] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.85rem] border border-beige/10 bg-[linear-gradient(180deg,rgba(253,249,245,0.98),rgba(245,237,228,0.97))] text-navy shadow-[0_34px_90px_-36px_rgba(0,0,0,0.62)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 md:border-beige/20"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-navy/10 bg-[linear-gradient(135deg,rgba(7,32,63,0.98),rgba(11,38,74,0.94))] px-5 py-5 text-beige md:px-7", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-gold", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
                    "Personal Sourcing"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Title, { className: "font-display text-3xl text-beige md:text-[2.35rem]", children: "Request a Perfume" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Description, { className: "mt-2 max-w-2xl text-sm leading-7 text-beige/72", children: "Share the fragrance name, your preferred size, and any reference photos. We'll try to source it for you." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-beige/15 bg-beige/8 text-beige/75 transition hover:border-gold/35 hover:text-gold", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "form",
                {
                  onSubmit,
                  noValidate: true,
                  className: "flex min-h-0 flex-1 flex-col overflow-hidden",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-0 max-h-[calc(90vh-120px)] flex-1 overflow-y-auto px-5 py-5 scroll-smooth md:px-7 md:py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-navy/60", children: "Perfume Name / Brand Name" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              value: form.perfumeName,
                              onChange: (event) => updateField("perfumeName", event.target.value),
                              placeholder: "Example: Belovita, Dior Sauvage, Afnan 9PM",
                              className: fieldCls
                            }
                          ),
                          errors.perfumeName ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", children: errors.perfumeName }) : null
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-navy/60", children: "Customer Name" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              value: form.customerName,
                              onChange: (event) => updateField("customerName", event.target.value),
                              placeholder: "Your full name",
                              className: fieldCls
                            }
                          ),
                          errors.customerName ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", children: errors.customerName }) : null
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-navy/60", children: "Phone Number" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              value: form.phoneNumber,
                              onChange: (event) => updateField("phoneNumber", event.target.value),
                              placeholder: "+91 98765 43210",
                              className: fieldCls,
                              inputMode: "tel"
                            }
                          ),
                          errors.phoneNumber ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", children: errors.phoneNumber }) : null
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-navy/60", children: "Preferred Size" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "select",
                            {
                              value: form.preferredSize,
                              onChange: (event) => updateField("preferredSize", event.target.value),
                              className: fieldCls,
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select size" }),
                                SIZE_OPTIONS.map((size) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: size, children: size }, size))
                              ]
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block md:col-span-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-navy/60", children: "Budget Range" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "select",
                            {
                              value: form.budgetRange,
                              onChange: (event) => updateField("budgetRange", event.target.value),
                              className: fieldCls,
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select budget range" }),
                                DISPLAY_BUDGET_OPTIONS.map((budget) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: budget, children: budget }, budget))
                              ]
                            }
                          )
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-[0.7rem] uppercase tracking-[0.22em] text-navy/60", children: "Message / Notes" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "textarea",
                          {
                            value: form.message,
                            onChange: (event) => updateField("message", event.target.value),
                            placeholder: "Tell us size, concentration, budget, or any details...",
                            rows: 5,
                            className: `${fieldCls} resize-none`
                          }
                        ),
                        errors.message ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", children: errors.message }) : null
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[0.7rem] uppercase tracking-[0.22em] text-navy/60", children: "Upload perfume photos" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-navy/55", children: "You can add up to 3 images" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "label",
                          {
                            className: cn(
                              "group flex cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed px-5 py-7 text-center transition duration-300 ease-out",
                              dragging ? "border-gold bg-gold/8 shadow-[0_18px_40px_-28px_rgba(200,169,106,0.72)]" : "border-navy/18 bg-white/72 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-[0_18px_40px_-28px_rgba(7,32,63,0.28)]"
                            ),
                            onDragOver: (event) => {
                              event.preventDefault();
                              setDragging(true);
                            },
                            onDragLeave: (event) => {
                              event.preventDefault();
                              setDragging(false);
                            },
                            onDrop: (event) => {
                              event.preventDefault();
                              setDragging(false);
                              handleFiles(event.dataTransfer.files);
                            },
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gold/22 bg-gold/10 text-gold transition group-hover:scale-105", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-5 w-5" }) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-navy", children: "Drag photos here or tap to choose from your gallery" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 text-xs uppercase tracking-[0.18em] text-navy/45", children: "JPG, PNG, WEBP | Max 5MB each" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "input",
                                {
                                  ref: inputRef,
                                  type: "file",
                                  accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
                                  multiple: true,
                                  className: "sr-only",
                                  onChange: (event) => handleFiles(event.target.files || [])
                                }
                              )
                            ]
                          }
                        ),
                        errors.images ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: errors.images }) : null,
                        previews.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3", children: previews.map((preview, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            className: "group relative overflow-hidden rounded-[1.2rem] border border-navy/10 bg-white shadow-soft",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "img",
                                {
                                  src: preview.url,
                                  alt: `Perfume reference ${index + 1}`,
                                  className: "aspect-square h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "button",
                                {
                                  type: "button",
                                  onClick: () => removeFile(index),
                                  className: "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-navy/78 text-beige shadow-lg transition hover:bg-[#0d2b53]",
                                  "aria-label": `Remove image ${index + 1}`,
                                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                                }
                              )
                            ]
                          },
                          `${preview.name}-${index}`
                        )) }) : null
                      ] })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-0 border-t border-navy/10 bg-[linear-gradient(180deg,rgba(253,249,245,0.98),rgba(245,237,228,0.97))] px-5 py-4 md:px-7", children: [
                      errors.submit ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700", children: errors.submit }) : null,
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-navy/55", children: "We usually reply after checking availability." }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            type: "submit",
                            variant: "gold",
                            disabled: submitting,
                            className: "w-full rounded-full px-7 py-3.5 text-[0.72rem] tracking-[0.28em] hover:-translate-y-0.5 hover:shadow-[0_22px_46px_-24px_rgba(200,169,106,0.9)] sm:w-auto",
                            children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                              "Sending..."
                            ] }) : "Submit Request"
                          }
                        )
                      ] })
                    ] })
                  ]
                }
              )
            ]
          }
        )
      ] })
    }
  );
}
const PerfumeRequestSection = reactExports.memo(function PerfumeRequestSection2() {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-navy py-[var(--section-space)] text-beige", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.8, ease: "easeOut" },
        className: "overflow-hidden rounded-[var(--radius-panel)] border border-beige/12 bg-[linear-gradient(135deg,rgba(7,32,63,0.98),rgba(10,34,63,0.95)_48%,rgba(18,47,80,0.92))] shadow-[0_32px_80px_-42px_rgba(0,0,0,0.7)]",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 px-5 py-6 sm:px-6 sm:py-8 md:grid-cols-[1.1fr_0.9fr] md:items-end md:px-10 md:py-12", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fluid-eyebrow mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 uppercase text-gold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
              "Private Queries"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "max-w-2xl font-display text-[clamp(2rem,4vw,3.7rem)] leading-[0.94] text-beige", children: "Can't find your fragrance?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-body mt-5 max-w-xl text-beige/75", children: "Request a perfume and we'll try to source it for you. Share the bottle name, wishlist details, and reference photos if you have them." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[clamp(1.2rem,2vw,1.6rem)] border border-beige/10 bg-beige/6 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-eyebrow uppercase text-gold/85", children: "Personal sourcing desk" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-body-sm mt-3 text-beige/70", children: "Send the fragrance name, preferred size, budget, and up to three reference photos from your gallery. We'll review the request and contact you." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "gold",
                onClick: () => setOpen(true),
                className: "mt-6 w-full rounded-full hover:-translate-y-1 hover:shadow-[0_28px_54px_-24px_rgba(200,169,106,0.92)] md:w-auto",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
                  "Request a Perfume",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
                ] })
              }
            )
          ] })
        ] })
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PerfumeRequestDialog, { open, onOpenChange: setOpen })
  ] });
});
export {
  PerfumeRequestSection
};
