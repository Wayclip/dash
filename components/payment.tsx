'use client';

import axios from 'axios';
import { useAuth } from '@/contexts/authContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPaymentInfo, ParsedPaymentInfo } from '@/lib/utils';

export const PaymentVerificationClient = () => {
    const api_url = process.env.NEXT_PUBLIC_API_URL;
    const { user, refreshUser, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [initialTier, setInitialTier] = useState<string | undefined>(undefined);
    const [paymentInfo, setPaymentInfo] = useState<ParsedPaymentInfo | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const payment = getPaymentInfo();
            setPaymentInfo(payment);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (user && initialTier === undefined) {
            setInitialTier(user.tier);
        }
    }, [user, initialTier]);

    useEffect(() => {
        if (isLoading || !user || initialTier === undefined) {
            return;
        }

        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
            setStatus('error');
            return;
        }

        if (!paymentInfo?.payments_enabled) {
            setStatus('error');
            console.error('Payments are disabled');
            return;
        }

        const verifyStripeSession = async () => {
            try {
                const response = await axios.get(`${api_url}/api/checkout/verify-session?session_id=${sessionId}`, {
                    withCredentials: true,
                });

                if (response.data.status === 'paid') {
                    setStatus('success');
                } else if (response.data.status === 'open') {
                    setTimeout(verifyStripeSession, 3000);
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error('Verification failed:', error);
                setStatus('error');
            }
        };

        verifyStripeSession();
    }, [isLoading, user, initialTier, searchParams, api_url, paymentInfo]);

    useEffect(() => {
        if (status !== 'success' || !user || initialTier === undefined) {
            return;
        }

        if (user.tier !== initialTier) {
            const redirectTimer = setTimeout(() => {
                router.replace('/dash');
            }, 2000);

            return () => clearTimeout(redirectTimer);
        }

        const pollInterval = setInterval(() => {
            refreshUser();
        }, 2000);

        const maxWaitTimer = setTimeout(() => {
            clearInterval(pollInterval);
            router.replace('/dash');
        }, 10000);

        return () => {
            clearInterval(pollInterval);
            clearTimeout(maxWaitTimer);
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
                            Invalid session. Please check your account or contact support via support@wayclip.com.
                        </CardDescription>
                    </>
                );
            case 'verifying':
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
