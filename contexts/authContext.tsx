'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface UserProfile {
    user: {
        id: string;
        github_id: number;
        username: string;
        avatar_url: string | null;
        tier: 'free' | 'tier1' | 'tier2' | 'tier3';
        is_banned: boolean;
    };
    storage_used: number;
    storage_limit: number;
    clip_count: number;
}

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!API_URL) {
                console.error('Error: NEXT_PUBLIC_API_URL is not defined. Please check your .env.local file.');
                setIsLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API_URL}/api/me`, {
                    withCredentials: true,
                });

                if (response.data) {
                    setUser(response.data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const logout = () => {
        setUser(null);
        window.location.href = '/login';
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
