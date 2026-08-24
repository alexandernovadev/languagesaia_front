import { ReactNode } from "react";
import { Button } from "./button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export interface HeaderAction {
  id: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
}

interface ActionButtonsHeaderProps {
  actions: HeaderAction[];
}

/**
 * Responsive action list for PageHeader: full icon+label buttons on desktop,
 * collapsed into a three-dot dropdown menu on mobile so the header never
 * overflows/wraps.
 */
export function ActionButtonsHeader({ actions }: ActionButtonsHeaderProps) {
  if (actions.length === 0) return null;

  return (
    <>
      <div className="hidden sm:flex items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || "outline"}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            <span className="mr-2 flex items-center">{action.icon}</span>
            {action.label}
          </Button>
        ))}
      </div>

      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
                className="flex items-center gap-3 cursor-pointer"
              >
                {action.icon}
                <span>{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
