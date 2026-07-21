import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuToggle={toggleSidebar} />

        <main
          className={cn(
            "flex-1 overflow-y-auto p-6 transition-all duration-300"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
