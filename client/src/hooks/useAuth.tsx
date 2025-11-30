import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LoginInput, RegisterInput } from "@/schemas/auth";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
    loginMutation: UseMutationResult<User, Error, LoginInput>;
    logoutMutation: UseMutationResult<void, Error, void>;
    registerMutation: UseMutationResult<User, Error, RegisterInput>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const {
        data: user,
        error,
        isLoading,
    } = useQuery<User | undefined, Error>({
        queryKey: ["/api/user"],
        retry: false,
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginInput) => {
            const res = await apiRequest("POST", "/api/login", credentials);
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Login failed");
            }
            return await res.json();
        },
        onSuccess: (user: User) => {
            queryClient.setQueryData(["/api/user"], user);
            toast({
                title: "Welcome back!",
                description: `Signed in as ${user.username}`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Login failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (credentials: RegisterInput) => {
            const res = await apiRequest("POST", "/api/register", credentials);
            if (!res.ok) {
                // Handle 409 Conflict specifically
                if (res.status === 409) {
                    const text = await res.text();
                    throw new Error(text); // "Username already exists" or "Email already exists"
                }
                const error = await res.json();
                throw new Error(error.message || "Registration failed");
            }
            return await res.json();
        },
        onSuccess: () => {
            // Note: The original implementation didn't auto-login after register, but typically you might want to.
            // For now, we'll stick to the existing flow or the user's request.
            // The user request says "returns { user: {...}, token } on success", implying auto-login might be expected or just return data.
            // However, the previous auth.tsx switched to login tab.
            // Let's assume we want to auto-login or at least invalidate user query if the backend sets a session.
            // If the backend sets a session on register, we should update the query cache.
            // The current backend /api/register does NOT log the user in, it just creates them.
            // So we won't setQueryData here.
            toast({
                title: "Account created",
                description: "Please sign in with your new account.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Registration failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", "/api/logout");
        },
        onSuccess: () => {
            queryClient.clear();
            toast({
                title: "Signed out",
                description: "You have been successfully logged out.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Logout failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return (
        <AuthContext.Provider
            value={{
                user: user ?? null,
                isLoading,
                error,
                loginMutation,
                logoutMutation,
                registerMutation,
            }
            }
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
