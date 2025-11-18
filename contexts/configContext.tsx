'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppConfig } from '@/app/api/config/route';

interface ConfigContextType {
    config: AppConfig | null;
    isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/config');
                if (!response.ok) {
                    throw new Error('Failed to fetch application configuration.');
                }
                const data: AppConfig = await response.json();
                setConfig(data);
            } catch (err) {
                console.error(err);
                setConfig(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const value = { config, isLoading };

    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
