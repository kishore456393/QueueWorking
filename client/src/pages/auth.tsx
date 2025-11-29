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
import { Loader2, ShieldCheck } from "lucide-react";

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (user) {
            setLocation("/");
        }
    }, [user, setLocation]);

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
        console.log("Login attempt with:", { username: data.username, passwordLength: data.password.length });
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
            <Card className="w-full max-w-md border-card-border shadow-md">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                    </div>
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
                    {isLogin ? (
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-username">Username</Label>
                                <Input
                                    id="login-username"
                                    {...loginForm.register("username")}
                                    disabled={loginMutation.isPending}
                                    placeholder="Enter your username"
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
                                <Input
                                    id="login-password"
                                    type="password"
                                    {...loginForm.register("password")}
                                    disabled={loginMutation.isPending}
                                    placeholder="Enter your password"
                                    className="h-10"
                                />
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

                            <div className="text-center text-sm pt-2">
                                <span className="text-muted-foreground">Don't have an account? </span>
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(false)}
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
                                <Input
                                    id="register-password"
                                    type="password"
                                    {...registerForm.register("password")}
                                    disabled={registerMutation.isPending}
                                    placeholder="Create a password"
                                    className="h-10"
                                />
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

                            <div className="text-center text-sm pt-2">
                                <span className="text-muted-foreground">Already have an account? </span>
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(true)}
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
    );
}
