'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';

type CredentialProvider = 'email' | 'github' | 'google' | 'discord';
export type SubscriptionTier = 'free' | 'tier1' | 'tier2' | 'tier3';

interface UserProfile {
    id: string;
    github_id?: number;
    username: string;
    email?: string;
    avatar_url: string | null;
    tier: 'free' | 'tier1' | 'tier2' | 'tier3';
    is_banned: boolean;
    two_factor_enabled: boolean;
    email_verified_at?: string;
    storage_used: number;
    storage_limit: number;
    clip_count: number;
    connected_accounts: CredentialProvider[];
    role: 'user' | 'admin';
    last_login_at?: string;
    last_login_ip?: string;
}

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

export interface Clip {
    id: string;
    file_name: string;
    file_size: number;
    created_at: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'https://wayclip.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const doLogout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout request failed, proceeding with client-side logout:', error);
        } finally {
            setUser(null);
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
    };

    const fetchUser = useCallback(async () => {
        if (!API_URL) {
            console.error('Error: NEXT_PUBLIC_API_URL is not defined. Please check your .env.local file.');
            setIsLoading(false);
            return;
        }
        try {
            const response = await axios.get<UserProfile>(`${API_URL}/api/me`, {
                withCredentials: true,
            });

            if (response.data) {
                if (response.data.is_banned) {
                    await doLogout();
                } else {
                    setUser(response.data);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error(error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const refreshUser = async () => {
        setIsLoading(true);
        await fetchUser();
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        logout: doLogout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
