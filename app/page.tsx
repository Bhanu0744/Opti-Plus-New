"use client";

import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, BarChart3, Settings, Bell, Search } from "lucide-react";

export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Redirect to /login if not authenticated
  React.useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null; // Prevent flicker

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white">
              <BarChart3 size={18} />
            </div>
            <span className="text-xl font-bold">Opti-Plus</span>
          </div>
          
          <div className="hidden flex-1 px-4 md:flex md:justify-center">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-slate-600 hover:bg-slate-100">
              <Bell size={20} />
            </button>
            <button className="rounded-full p-2 text-slate-600 hover:bg-slate-100">
              <Settings size={20} />
            </button>
            
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 text-sm"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <User size={16} />
                </div>
                <span className="hidden md:inline-block">{user.name}</span>
                <LogOut className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
          <p className="text-sm text-slate-600">Here's what's happening with your account today.</p>
        </div>
        
        
        {/* Recent Activity Section */}
     
      </main>
    </div>
  );
}
