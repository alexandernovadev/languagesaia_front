import { ReactNode } from "react";
import { SidebarTrigger } from "./sidebar";

interface PageHeaderProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  footer?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
  filters,
  footer,
}: PageHeaderProps) {
  return (
    <div className="sticky top-[-0.1rem] z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 mb-4">
      {/* Title Section */}

      <div className="flex items-start gap-3 pt-4">
        <div className="md:hidden">
          <SidebarTrigger className="h-8 w-8 border-none" />
        </div>
        <div className="flex-1 min-w-0">
          {title && <h1 className="text-lg sm:text-xl md:text-3xl font-bold">{title}</h1>}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Filters Section */}
      {filters && <div className="mt-4 pb-4">{filters}</div>}

      {/* Footer Section (sticky, always visible) */}
      {footer && <div className="pb-4">{footer}</div>}
    </div>
  );
}
