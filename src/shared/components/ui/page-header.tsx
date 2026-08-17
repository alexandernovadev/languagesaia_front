import { ReactNode } from "react";
import { SidebarTrigger } from "./sidebar";

interface PageHeaderProps {
  title: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
}

export function PageHeader({
  title,
  actions,
  filters,
}: PageHeaderProps) {
  return (
    <div className="sticky top-[-0.1rem] z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 mb-4">
      {/* Title Section */}

      <div className="flex items-start gap-3 pt-4">
        <div className="md:hidden">
          <SidebarTrigger className="h-8 w-8 border-none" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-3xl font-bold">{title}</h1>
        </div>
        {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Filters Section */}
      {filters && <div className="mt-4 pb-4">{filters}</div>}
    </div>
  );
}
