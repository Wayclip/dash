'use client';

import axios from 'axios';
import { useAuth } from '@/contexts/authContext';
import { useConfig } from '@/contexts/configContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PaymentVerificationClient = () => {
    const { config } = useConfig();
    const { user, refreshUser, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [initialTier, setInitialTier] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (user && initialTier === undefined) {
            setInitialTier(user.tier);
        }
    }, [user, initialTier]);

    const verifySession = useCallback(
        async (sessionId: string) => {
            if (!config?.apiUrl) return;
            try {
                const response = await axios.get(
                    `${config.apiUrl}/api/checkout/verify-session?session_id=${sessionId}`,
                    { withCredentials: true },
                );
                if (response.data.status === 'paid') {
                    setStatus('success');
                } else if (response.data.status === 'open') {
                    setTimeout(() => verifySession(sessionId), 3000);
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error(error);
                setStatus('error');
            }
        },
        [config?.apiUrl],
    );

    useEffect(() => {
        if (isLoading || !user || initialTier === undefined || !config) return;

        const sessionId = searchParams.get('session_id');
        if (!sessionId || !config.paymentsEnabled) {
            setStatus('error');
            return;
        }

        verifySession(sessionId);
    }, [isLoading, user, initialTier, config, searchParams, verifySession]);

    useEffect(() => {
        if (status !== 'success' || !user || initialTier === undefined) return;

        const checkUserTier = async () => {
            await refreshUser();
            if (user.tier !== initialTier) {
                setTimeout(() => router.replace('/dash'), 2000);
                return true;
            }
            return false;
        };

        const intervalId = setInterval(async () => {
            const updated = await checkUserTier();
            if (updated) clearInterval(intervalId);
        }, 2000);

        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            router.replace('/dash');
        }, 10000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [status, user, initialTier, refreshUser, router]);

    const renderContent = () => {
        switch (status) {
            case 'success':
                return (
                    <>
                        <CheckCircle2 className='h-16 w-16 text-green-500' />
                        <CardTitle className='mt-4 text-2xl'>Payment Successful!</CardTitle>
                        <CardDescription>
                            Your subscription is active. Finalizing and redirecting to your dashboard...
                        </CardDescription>
                    </>
                );
            case 'error':
                return (
                    <>
                        <XCircle className='h-16 w-16 text-destructive' />
                        <CardTitle className='mt-4 text-2xl'>Verification Failed</CardTitle>
                        <CardDescription>
                            Invalid session. Please check your account or contact support.
                        </CardDescription>
                    </>
                );
            default:
                return (
                    <>
                        <Loader2 className='h-16 w-16 animate-spin text-primary' />
                        <CardTitle className='mt-4 text-2xl'>Verifying Payment</CardTitle>
                        <CardDescription>
                            Please wait while we confirm your subscription. This may take a moment.
                        </CardDescription>
                    </>
                );
        }
    };

    return (
        <div className='flex min-h-screen w-full items-center justify-center bg-muted/40'>
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <div className='flex flex-col items-center justify-center space-y-4 p-6'>{renderContent()}</div>
                </CardHeader>
            </Card>
        </div>
    );
};

export default PaymentVerificationClient;
