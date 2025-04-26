"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/AuthProvider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import React from "react";

// Zod schema for login form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Handle form submission
  function onSubmit(values: LoginFormValues) {
    login(values.email, values.password);
    router.push("/");
  }

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
  