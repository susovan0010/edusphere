import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  accent = false,
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`bg-navy-850 border border-navy-700/80 rounded-lg p-5 shadow-aristocrat transition-all duration-200 ${
        accent ? "border-l-4 border-l-gold-500" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = "" }) => {
  return (
    <div className={`flex items-start justify-between pb-4 border-b border-navy-700/60 mb-4 ${className}`}>
      <div>
        <h3 className="font-serif text-lg font-semibold text-ivory-100 tracking-wide">{title}</h3>
        {subtitle && <p className="text-xs text-ivory-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
