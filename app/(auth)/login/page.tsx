"use client";

import React from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { LogIn } from "@/components/icons";
import { 
  AuthLayout, 
  AuthFooter, 
  LoginForm, 
  SocialLoginButtons 
} from "@/components/modules/auth";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  return (
    <AuthLayout
      title="Sign in to your account"
      description="Enter your credentials below"
      headerTitle="Welcome back"
      headerDescription="Enter your credentials to sign in"
      icon={
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white">
          <LogIn size={32} />
        </div>
      }
      footerContent={
        <AuthFooter
          text="Don't have an account?"
          linkText="Create an account"
          linkHref="/register"
        >
          <SocialLoginButtons />
        </AuthFooter>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
  