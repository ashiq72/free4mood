import type { ElementType } from "react";

type ActionButtonProps = {
  icon: ElementType;
  label: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
};

export const ActionButton = ({
  icon: Icon,
  label,
  className = "",
  onClick,
  disabled = false,
  active = false,
}: ActionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-[var(--mood-surface-soft)] disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer ${className}`}
  >
    <Icon
      className={`w-5 h-5 ${
        active
          ? "fill-current text-[var(--mood-coral)]"
          : "text-[var(--mood-muted)] group-hover:text-[var(--mood-ink)]"
      }`}
    />
    <span
      className={`text-sm font-medium ${
        active
          ? "text-[var(--mood-coral)]"
          : "text-[var(--mood-muted)] group-hover:text-[var(--mood-ink)]"
      }`}
    >
      {label}
    </span>
  </button>
);
