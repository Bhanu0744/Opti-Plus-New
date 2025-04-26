import React from "react";
import { OptiPlusLogo } from "@/components/icons";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  headerTitle?: string;
  headerDescription?: string;
  footerContent?: React.ReactNode;
  icon?: React.ReactNode;
}

export function AuthLayout({
  children,
  title,
  description,
  headerTitle,
  headerDescription,
  footerContent,
  icon
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          {icon || (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white">
              <OptiPlusLogo size={32} />
            </div>
          )}
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Opti-Plus</h1>
          <p className="mt-1 text-sm text-slate-500">{title}</p>
        </div>
        
        <Card className="border-slate-100 shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">{headerTitle || title}</CardTitle>
            <CardDescription>{headerDescription || description}</CardDescription>
          </CardHeader>
          
          <CardContent className="pb-6">
            {children}
          </CardContent>
          
          {footerContent && (
            <CardFooter className="flex w-full flex-col space-y-4 border-t bg-slate-50 px-4 py-4">
              {footerContent}
            </CardFooter>
          )}
        </Card>
        
        <div className="mt-6 text-center text-xs text-slate-500">
          By signing in, you agree to our{' '}
          <Link href="#" className="text-indigo-600 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" className="text-indigo-600 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
} 