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
    className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed dark:hover:bg-zinc-800 rounded-lg transition-colors group cursor-pointer ${className}`}
  >
    <Icon
      className={`w-5 h-5 ${
        active
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200"
      }`}
    />
    <span
      className={`text-sm font-medium ${
        active
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200"
      }`}
    >
      {label}
    </span>
  </button>
);
