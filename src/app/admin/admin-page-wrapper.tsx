import React from 'react';

type AdminPageWrapperProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
};

export function AdminPageWrapper({ children, title, subtitle, description, actions }: AdminPageWrapperProps) {
  return (
    <div className="space-y-5">
      {(title || subtitle || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            {title && (
              <h1 className="text-2xl font-bold text-foreground uppercase tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {title}
              </h1>
            )}
            {(subtitle || description) && (
              <p className="text-sm text-muted-foreground max-w-2xl">
                {subtitle || description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
