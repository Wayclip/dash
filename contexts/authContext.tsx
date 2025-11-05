'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { useConfig } from './configContext';

type CredentialProvider = 'email' | 'github' | 'google' | 'discord';

interface UserProfile {
    id: string;
    github_id?: number;
    username: string;
    email?: string;
    avatar_url: string | null;
    tier: string;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { config, isLoading: isConfigLoading } = useConfig();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const doLogout = useCallback(async () => {
        if (config?.apiUrl) {
            try {
                await axios.post(`${config.apiUrl}/api/logout`, {}, { withCredentials: true });
            } catch (error) {
                console.error('Logout request failed, proceeding client-side.', error);
            }
        }
        setUser(null);
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }, [config?.apiUrl]);

    const fetchUser = useCallback(async () => {
        if (isConfigLoading || !config?.apiUrl) {
            return;
        }
        try {
            const response = await axios.get<UserProfile>(`${config.apiUrl}/api/me`, {
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
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [config?.apiUrl, doLogout, isConfigLoading]);

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
        isLoading: isLoading || isConfigLoading,
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
