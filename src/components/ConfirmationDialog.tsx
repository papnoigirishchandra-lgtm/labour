import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  action: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmationDialog = ({
  open,
  title,
  description,
  action,
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
}: ConfirmationDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative glass rounded-2xl p-6 max-w-sm mx-4 border border-border shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          {isDestructive && (
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <h2 className="font-display font-semibold text-lg">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg glass hover:bg-border transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDestructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            } disabled:opacity-50`}
          >
            {isLoading ? "Loading..." : action}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
