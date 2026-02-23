import type { ElementType } from "react";

type ActionButtonProps = {
  icon: ElementType;
  label: string;
  className?: string;
};

export const ActionButton = ({
  icon: Icon,
  label,
  className = "",
}: ActionButtonProps) => (
  <button
    className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group cursor-pointer ${className}`}
  >
    <Icon className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
    <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200">
      {label}
    </span>
  </button>
);
