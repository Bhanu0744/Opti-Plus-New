// Boilerplate layout for the (app) route group
// This layout wraps all pages in the (app) directory
// It provides a consistent structure and styling for the app section
// Note: This is a nested layout, so do NOT include <html> or <body> tags.

"use client";

import React from "react";
import { useAuth } from "@/components/AuthProvider";
import AppSidebar from "@/components/modules/navigation/app-sidebar";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";

// The children prop will be the page content rendered inside this layout
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to /login if not authenticated
  React.useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null; // Prevent flicker

  // Use a flex container with a fixed-width sidebar and flex-1 main content
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        {/* Sidebar with fixed width, never overlays main content */}
        <div className="w-[22rem] flex-shrink-0">
          <AppSidebar />
        </div>
        {/* Main content area fills remaining space */}
        <main className="flex-1 overflow-auto min-w-0 w-full">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

