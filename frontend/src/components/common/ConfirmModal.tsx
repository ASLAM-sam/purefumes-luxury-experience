import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/common/Button";

type ConfirmModalProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmModal({
  isOpen,
  title = "Confirm action",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-navy/65 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-navy shadow-luxe">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 id="confirm-modal-title" className="font-display text-2xl text-navy">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-navy/65">{message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-2 text-navy/45 transition hover:bg-beige hover:text-navy disabled:opacity-50"
            aria-label="Close confirmation modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="!bg-red-600 !text-white hover:!opacity-90"
          >
            {loading ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
