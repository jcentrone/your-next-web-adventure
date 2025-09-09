import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface ActionItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface ActionsMenuProps {
  actions: ActionItem[];
  trigger?: React.ReactNode;
  align?: "start" | "end" | "center";
}

export const ActionsMenu: React.FC<ActionsMenuProps> = ({ 
  actions,
  trigger,
  align = "end"
}) => {
  const defaultTrigger = (
    <Button variant="ghost" className="h-8 w-8 p-0">
      <span className="sr-only">Open menu</span>
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  );

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            {trigger || defaultTrigger}
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Actions</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align={align} className="w-56">
        {actions.map((action, index) => (
          <React.Fragment key={action.key}>
            <DropdownMenuItem
              onClick={action.onClick}
              disabled={action.disabled}
              className={action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
            >
              <span className="mr-2">{action.icon}</span>
              {action.label}
            </DropdownMenuItem>
            {action.variant === "destructive" && index < actions.length - 1 && (
              <DropdownMenuSeparator />
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};