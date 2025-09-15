'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const refreshUser = async () => {
        setIsLoading(true);
        await fetchUser();
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout request failed, proceeding with client-side logout:', error);
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
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
