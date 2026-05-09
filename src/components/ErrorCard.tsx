import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface ErrorCardProps {
  title?: string;
  message: string;
  details?: string;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export const ErrorCard = ({
  title,
  message,
  details,
  onDismiss,
  dismissible = true,
}: ErrorCardProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="glass rounded-2xl p-4 border border-destructive/30 bg-destructive/5">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <h4 className="font-semibold text-destructive mb-1">{title}</h4>}
          <p className="text-sm text-muted-foreground">{message}</p>
          {details && (
            <p className="text-xs text-muted-foreground mt-2 font-mono bg-black/10 p-2 rounded">
              {details}
            </p>
          )}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
