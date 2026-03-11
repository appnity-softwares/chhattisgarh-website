import React from 'react';

type AdminPageWrapperProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
};

export function AdminPageWrapper({ children, title, subtitle }: AdminPageWrapperProps) {
  return (
    <div className="space-y-6">
      {(title || subtitle) && (
        <div className="flex flex-col gap-1">
          {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
