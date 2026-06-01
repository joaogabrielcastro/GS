import React from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    {Icon ? (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gs-gray-100 text-gs-gray-500">
        <Icon className="h-7 w-7" />
      </div>
    ) : null}
    <p className="text-base font-semibold text-gs-black">{title}</p>
    {description ? (
      <p className="mt-1 max-w-sm text-sm text-gs-gray-600 leading-relaxed">{description}</p>
    ) : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export default EmptyState;
