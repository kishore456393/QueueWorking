import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, insertUserSchema, LoginInput, RegisterInput } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function AuthPage() {
    const { user, loginMutation, registerMutation, googleLoginMutation } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [oauthError, setOauthError] = useState<string | null>(null);
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (user) {
            setLocation("/");
        }
    }, [user, setLocation]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        const errorDescription = params.get("error_description");

        if (error || errorDescription) {
            setOauthError(errorDescription || error || "Google sign-in failed. Please verify your Supabase Google OAuth setup.");
            params.delete("error");
            params.delete("error_description");
            const newQuery = params.toString();
            const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}${window.location.hash}`;
            window.history.replaceState({}, "", newUrl);
        }
    }, []);

    const loginForm = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const registerForm = useForm<RegisterInput>({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            username: "",
            password: "",
        },
    });

    if (user) {
        return null;
    }

    const onLoginSubmit = (data: LoginInput) => {
        loginMutation.mutate(data);
    };

    const onRegisterSubmit = (data: RegisterInput) => {
        registerMutation.mutate(data, {
            onSuccess: () => {
                setIsLogin(true);
                registerForm.reset();
            },
        });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">QueueGuidance</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Sign in to monitor queues, analytics, and settings.
                    </p>
                </div>

                <Card className="w-full border-card-border shadow-md">
                <CardHeader className="text-center space-y-4">
                    <div>
                        <CardTitle className="text-2xl">
                            {isLogin ? "Sign In" : "Create Account"}
                        </CardTitle>
                        <CardDescription className="mt-2">
                            {isLogin
                                ? "Welcome back to QueueGuidance"
                                : "Join QueueGuidance today"}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {oauthError && (
                        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {oauthError}
                        </div>
                    )}

                    {isLogin ? (
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-username">Email</Label>
                                <Input
                                    id="login-username"
                                    {...loginForm.register("username")}
                                    disabled={loginMutation.isPending}
                                    placeholder="you@company.com"
                                    className="h-10"
                                />
                                {loginForm.formState.errors.username && (
                                    <p className="text-sm text-destructive">
                                        {loginForm.formState.errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="login-password"
                                        type={showLoginPassword ? "text" : "password"}
                                        {...loginForm.register("password")}
                                        disabled={loginMutation.isPending}
                                        placeholder="Enter your password"
                                        className="h-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                                    >
                                        {showLoginPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {loginForm.formState.errors.password && (
                                    <p className="text-sm text-destructive">
                                        {loginForm.formState.errors.password.message}
                                    </p>
                                )}
                            </div>

                            {loginMutation.isError && (
                                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                    {loginMutation.error?.message || "Invalid username or password"}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Sign In
                            </Button>

                            <div className="my-4 flex items-center gap-3">
                                <Separator className="flex-1" />
                                <span className="text-xs text-muted-foreground">or</span>
                                <Separator className="flex-1" />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => googleLoginMutation.mutate()}
                                disabled={googleLoginMutation.isPending || loginMutation.isPending || registerMutation.isPending}
                            >
                                {googleLoginMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <svg
                                        className="mr-2 h-4 w-4"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M21.35 11.1H12v2.98h5.35c-.23 1.29-1.49 3.78-5.35 3.78-3.22 0-5.84-2.66-5.84-5.93S8.78 6 12 6c1.83 0 3.06.78 3.76 1.45l2.56-2.46C16.67 3.44 14.53 2.4 12 2.4 6.92 2.4 2.8 6.52 2.8 11.6S6.92 20.8 12 20.8c6.01 0 8.58-4.23 8.58-6.42 0-.43-.05-.76-.11-1.08z"
                                        />
                                    </svg>
                                )}
                                Continue with Google
                            </Button>

                            <div className="text-center text-sm pt-2">
                                <span className="text-muted-foreground">Don't have an account? </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(false);
                                    }}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Create one
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-firstname">First Name</Label>
                                    <Input
                                        id="register-firstname"
                                        {...registerForm.register("firstName")}
                                        disabled={registerMutation.isPending}
                                        placeholder="First name"
                                        className="h-10"
                                    />
                                    {registerForm.formState.errors.firstName && (
                                        <p className="text-sm text-destructive">
                                            {registerForm.formState.errors.firstName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-lastname">Last Name</Label>
                                    <Input
                                        id="register-lastname"
                                        {...registerForm.register("lastName")}
                                        disabled={registerMutation.isPending}
                                        placeholder="Last name"
                                        className="h-10"
                                    />
                                    {registerForm.formState.errors.lastName && (
                                        <p className="text-sm text-destructive">
                                            {registerForm.formState.errors.lastName.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-email">Email</Label>
                                <Input
                                    id="register-email"
                                    type="email"
                                    {...registerForm.register("email")}
                                    disabled={registerMutation.isPending}
                                    placeholder="your.email@example.com"
                                    className="h-10"
                                />
                                {registerForm.formState.errors.email && (
                                    <p className="text-sm text-destructive">
                                        {registerForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-username">Username</Label>
                                <Input
                                    id="register-username"
                                    {...registerForm.register("username")}
                                    disabled={registerMutation.isPending}
                                    placeholder="Choose a username"
                                    className="h-10"
                                />
                                {registerForm.formState.errors.username && (
                                    <p className="text-sm text-destructive">
                                        {registerForm.formState.errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="register-password"
                                        type={showRegisterPassword ? "text" : "password"}
                                        {...registerForm.register("password")}
                                        disabled={registerMutation.isPending}
                                        placeholder="Create a password"
                                        className="h-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                        aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                                    >
                                        {showRegisterPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {registerForm.formState.errors.password && (
                                    <p className="text-sm text-destructive">
                                        {registerForm.formState.errors.password.message}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Use 8+ characters with uppercase, numbers & symbols
                                </p>
                            </div>

                            {registerMutation.isError && (
                                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                    {registerMutation.error?.message || "Registration failed"}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={registerMutation.isPending}
                            >
                                {registerMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create Account
                            </Button>

                            <div className="my-4 flex items-center gap-3">
                                <Separator className="flex-1" />
                                <span className="text-xs text-muted-foreground">or</span>
                                <Separator className="flex-1" />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => googleLoginMutation.mutate()}
                                disabled={googleLoginMutation.isPending || loginMutation.isPending || registerMutation.isPending}
                            >
                                {googleLoginMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <svg
                                        className="mr-2 h-4 w-4"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M21.35 11.1H12v2.98h5.35c-.23 1.29-1.49 3.78-5.35 3.78-3.22 0-5.84-2.66-5.84-5.93S8.78 6 12 6c1.83 0 3.06.78 3.76 1.45l2.56-2.46C16.67 3.44 14.53 2.4 12 2.4 6.92 2.4 2.8 6.52 2.8 11.6S6.92 20.8 12 20.8c6.01 0 8.58-4.23 8.58-6.42 0-.43-.05-.76-.11-1.08z"
                                        />
                                    </svg>
                                )}
                                Continue with Google
                            </Button>

                            <div className="text-center text-sm pt-2">
                                <span className="text-muted-foreground">Already have an account? </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(true);
                                    }}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Sign in
                                </button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
            </div>
        </div>
    );
}
