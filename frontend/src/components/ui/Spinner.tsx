import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeClass = {
  sm: "h-6 w-6 border-2",
  md: "h-10 w-10 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  label,
  className = "",
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-3 ${className}`}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div
      className={`animate-spin rounded-full border-gs-gray-200 border-t-gs-orange-500 ${sizeClass[size]}`}
    />
    {label ? <p className="text-sm text-gs-gray-600">{label}</p> : null}
  </div>
);

export default Spinner;
