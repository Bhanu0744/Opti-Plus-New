"use client";

import React from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { UserPlus } from "@/components/icons";
import { 
  AuthLayout, 
  AuthFooter, 
  RegisterForm 
} from "@/components/modules/auth";

export default function RegisterPage() {
  const { user } = useAuth();
  const router = useRouter();

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  return (
    <AuthLayout
      title="Create your account"
      description="Fill out the form below to get started"
      headerTitle="Get started"
      headerDescription="Create a new account to get started"
      icon={
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white">
          <UserPlus size={32} />
        </div>
      }
      footerContent={
        <AuthFooter
          text="Already have an account?"
          linkText="Sign in"
          linkHref="/login"
        />
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}

