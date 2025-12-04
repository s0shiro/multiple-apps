"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login, signup, type LoginInput, type SignupInput, type FieldErrors } from "@/lib/actions/auth";


export function AuthForm() {
  const [loginErrors, setLoginErrors] = useState<FieldErrors<LoginInput>>({});
  const [signupErrors, setSignupErrors] = useState<FieldErrors<SignupInput>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLogin(formData: FormData) {
    setLoginErrors({});
    setGeneralError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (!result.success) {
        if (result.fieldErrors) {
          setLoginErrors(result.fieldErrors);
        }
        if (result.error) {
          setGeneralError(result.error);
        }
      }
    });
  }

  function handleSignup(formData: FormData) {
    setSignupErrors({});
    setGeneralError(null);
    startTransition(async () => {
      const result = await signup(formData);
      if (!result.success) {
        if (result.fieldErrors) {
          setSignupErrors(result.fieldErrors);
        }
        if (result.error) {
          setGeneralError(result.error);
        }
      }
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
        <CardDescription>
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form action={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  disabled={isPending}
                />
                {loginErrors.email && (
                  <p className="text-sm text-destructive">{loginErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isPending}
                />
                {loginErrors.password && (
                  <p className="text-sm text-destructive">{loginErrors.password}</p>
                )}
              </div>
              {generalError && (
                <p className="text-sm text-destructive">{generalError}</p>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form action={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Display Name</Label>
                <Input
                  id="register-name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  disabled={isPending}
                />
                {signupErrors.name && (
                  <p className="text-sm text-destructive">{signupErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  disabled={isPending}
                />
                {signupErrors.email && (
                  <p className="text-sm text-destructive">{signupErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isPending}
                />
                {signupErrors.password && (
                  <p className="text-sm text-destructive">{signupErrors.password}</p>
                )}
              </div>
              {generalError && (
                <p className="text-sm text-destructive">{generalError}</p>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
