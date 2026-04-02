import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", fullWidth = false, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            primary: "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
            outline: "border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-100",
            ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
        };

        const width = fullWidth ? "w-full" : "";

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
