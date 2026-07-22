import { useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  School,
  FileText,
  Settings,
  ChevronLeft,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Classrooms", href: "/classrooms", icon: School },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = useCallback(
    (href: string) => location.pathname === href,
    [location.pathname]
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Main sidebar navigation"
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:relative lg:z-auto",
          isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-[72px] lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span
            className={cn(
              "text-lg font-bold text-sidebar-foreground transition-opacity duration-200",
              !isOpen && "lg:hidden"
            )}
          >
            WattWise AI
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3" aria-label="Sidebar main menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                aria-label={item.title}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-all duration-200 group-hover:scale-110",
                    active
                      ? "text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                  )}
                />
                <span
                  className={cn(
                    "transition-opacity duration-200",
                    !isOpen && "lg:hidden"
                  )}
                >
                  {item.title}
                </span>

                {/* Tooltip for collapsed sidebar */}
                {!isOpen && hoveredItem === item.href && (
                  <div className="absolute left-full ml-2 hidden rounded-md bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-md lg:block animate-fade-in z-50">
                    {item.title}
                  </div>
                )}

                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 h-6 w-1 -translate-x-1.5 -translate-y-1/2 rounded-r-full bg-sidebar-accent-foreground" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse button - desktop only */}
        <div className="hidden border-t border-sidebar-border p-3 lg:block">
          <button
            onClick={onToggle}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                !isOpen && "rotate-180"
              )}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
