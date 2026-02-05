import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-1">
                {label && (
                    <label className="text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
            w-full h-10 px-3 rounded-lg border bg-white
            text-sm text-gray-900 placeholder:text-gray-400
            transition-all
            focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black
            disabled:opacity-50 disabled:bg-gray-50
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200"}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
