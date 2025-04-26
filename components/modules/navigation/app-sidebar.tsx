'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { LogOut, Building2, Cpu, Database, BarChart3, Globe, FileSpreadsheet, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/AuthProvider';
import { Dataset, fetchDatasets } from '@/components/modules/datasets/dataset-controller';

// Helper function to cleanup filenames
const cleanFilename = (filename: string) => {
  // Remove any numbers and special characters at the beginning
  console.log(filename)
  return filename.replace(/^\d+[-_\s]+/, '');
};

export default function AppSidebar() {
  const sidebarRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    datasets: pathname?.startsWith('/datasets') || false,
  });

  // Navigation items
  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Composite', href: '/composite', icon: Cpu },
    { name: 'Controllers', href: '/controllers', icon: Building2 },
    { name: 'Datasets', href: '/datasets', icon: Database, hasChildren: true },
    { name: 'Online', href: '/online', icon: Globe },
  ];    

  // Load datasets for the sidebar
  useEffect(() => {
    const loadDatasets = async () => {
      if (expandedSections.datasets) {
        try {
          setIsLoadingDatasets(true);
          const data = await fetchDatasets();
          setDatasets(data || []);
        } catch (error) {
          console.error('Failed to fetch datasets:', error);
        } finally {
          setIsLoadingDatasets(false);
        }
      }
    };
    
    loadDatasets();
  }, [expandedSections.datasets]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isActiveLink = (href: string) => {
    if (href === '/' && pathname === '/') {
      return true;
    }
    // Special case for dataset item links
    if (href.startsWith('/datasets/') && pathname === href) {
      return true;
    }
    return pathname === href || (pathname?.startsWith(href) && href !== '/');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Use a plain div as the root to avoid double sidebar gap/space
  return (
    <div
      ref={sidebarRef}
      className="h-full flex flex-col border-r border-black/10 pb-4 pt-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background"
      style={{ flexShrink: 0 }}
    >
      <SidebarHeader ref={headerRef} className="p-5">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight">Opti-Plus</span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
            Main Menu
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1 mt-4">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.hasChildren ? (
                  <div>
                    <div 
                      className="flex items-center justify-between p-3 px-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleSection(item.name.toLowerCase())}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-6 h-6">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className="text-base">{item.name}</span>
                      </div>
                      {expandedSections[item.name.toLowerCase()] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </div>
                    
                    {expandedSections[item.name.toLowerCase()] && (
                      <div className="ml-10 space-y-1 my-1">
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            isActive={isActiveLink(item.href)}
                            className="pl-4 py-2 text-sm"
                          >
                            <Link href={item.href}>
                              All Datasets
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        {isLoadingDatasets ? (
                          <div className="flex items-center text-xs text-muted-foreground py-2 pl-4">
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                            Loading...
                          </div>
                        ) : datasets.length > 0 ? (
                          datasets.slice(0, 5).map(dataset => (
                            <SidebarMenuItem key={dataset.id}>
                              <SidebarMenuButton
                                asChild
                                isActive={isActiveLink(`/datasets/${dataset.id}`)}
                                className="pl-4 py-2 text-sm"
                              >
                                <Link href={`/datasets/${dataset.id}`} className="flex items-center gap-2 truncate">
                                  <FileSpreadsheet className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="truncate">{cleanFilename(dataset.filename)}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))
                        ) : (
                          <div className="text-xs text-muted-foreground py-2 pl-4">
                            No datasets available
                          </div>
                        )}
                        
                        {datasets.length > 5 && (
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              className="pl-4 py-2 text-xs text-muted-foreground"
                            >
                              <Link href={item.href}>
                                + {datasets.length - 5} more datasets
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveLink(item.href)}
                      className="gap-4 py-3 px-4 relative group"
                    >
                      <Link href={item.href}>
                        <div className="relative flex items-center gap-4">
                          <div className="flex items-center justify-center w-6 h-6">
                            <item.icon className="h-5 w-5" />
                          </div>
                          <span className="text-base">{item.name}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </div>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter ref={footerRef} className="mt-auto border-t border-border/40 pt-6 bg-background/90">
        {user && (
          <div className="flex flex-col items-center gap-3 px-4 py-4 w-full">
            <Avatar className="h-14 w-14 border-2 border-primary/10 ring-2 ring-primary/5 mb-1">
              <AvatarImage src="/avatar.png" alt="User" />
              <AvatarFallback className="bg-primary/5 text-primary text-lg">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-row items-center justify-between w-full gap-2">
              <div className="flex flex-col min-w-0">
                <span className="text-base font-semibold tracking-tight max-w-[140px] truncate cursor-pointer" title={user.name || user.email}>
                  {user.name || user.email}
                </span>
                <span className="text-xs font-semibold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 w-fit tracking-wide">
                  User
                </span>
              </div>
              
              <div className="relative group ml-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </div>
  );
}