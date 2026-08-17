import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "maroon" | "sage" | "rust" | "navy" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "gold",
  size = "sm",
  className = "",
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    gold: "bg-gold-500/15 text-gold-400 border border-gold-500/30",
    maroon: "bg-maroon-500/20 text-maroon-300 border border-maroon-500/40",
    sage: "bg-sage-500/20 text-emerald-400 border border-sage-500/40",
    rust: "bg-rust-500/20 text-rose-400 border border-rust-500/40",
    navy: "bg-navy-800 text-ivory-300 border border-navy-700",
    outline: "bg-transparent text-ivory-300 border border-navy-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
