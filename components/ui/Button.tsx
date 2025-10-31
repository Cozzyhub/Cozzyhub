"use client";

import { forwardRef } from "react";
import { motion, type MotionProps } from "framer-motion";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  MotionProps & {
    variant?: "primary" | "ghost" | "link";
    size?: "sm" | "md" | "lg";
  };

const base =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};
const variants = {
  primary: "btn-primary border border-white/40 shadow-lg",
  ghost: "btn-ghost border",
  link: "text-gray-600 hover:text-gray-900 underline-offset-4 hover:underline",
};

const MotionButton = motion.button;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <MotionButton
        ref={ref}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(base, sizes[size], variants[variant], className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export default Button;
