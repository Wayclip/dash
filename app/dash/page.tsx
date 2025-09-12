'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, LogOut, Unplug } from 'lucide-react';
import { useAuth } from '@/contexts/authContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const pricingPlans = [
    {
        tierId: 'free',
        apiId: null,
        name: 'Free',
        price: '$0',
        priceFrequency: '',
        description: 'Perfect for trying out cloud sharing.',
        features: ['2GB cloud storage', 'Unlimited local recordings', 'Basic sharing links'],
        isPopular: false,
    },
    {
        tierId: 'tier1',
        apiId: 'basic',
        name: 'Basic',
        price: '$3.99',
        priceFrequency: '/ month',
        description: 'Great for regular content creators.',
        features: ['50GB cloud storage', 'All features from Free'],
        isPopular: true,
    },
    {
        tierId: 'tier2',
        apiId: 'plus',
        name: 'Plus',
        price: '$6.99',
        priceFrequency: '/ month',
        description: 'For power users and teams.',
        features: ['200GB cloud storage', 'All features from Basic'],
        isPopular: false,
    },
    {
        tierId: 'tier3',
        apiId: 'pro',
        name: 'Pro',
        price: '$14.99',
        priceFrequency: '/ month',
        description: 'For professional workflows.',
        features: ['1TB cloud storage', 'All features from Plus'],
        isPopular: false,
    },
];

const StatCard = ({ title, value, description }: { title: string; value: string; description?: string }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-base font-medium text-muted-foreground'>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-4xl font-bold tracking-tight'>{value}</p>
                {description && <p className='text-sm text-muted-foreground pt-1'>{description}</p>}
            </CardContent>
        </Card>
    );
};

const DashboardPage = () => {
    const { isAuthenticated, isLoading, user: userData, logout } = useAuth();
    const router = useRouter();
    const [isUpgrading, setIsUpgrading] = useState(false);

    useEffect(() => {
        console.log('dash, isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
        if (!isLoading && !isAuthenticated) {
            console.log('redirecting to /login');
            router.replace('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleRemoveConnection = async () => {
        if (
            window.confirm(
                'Are you sure you want to remove your GitHub connection and delete your account? This action cannot be undone.',
            )
        ) {
            alert('Account deletion functionality is not yet implemented on the backend.');
        }
    };

    const handleUpgrade = async (apiId: string | null) => {
        if (!apiId) return;

        setIsUpgrading(true);
        try {
            console.log('Upgrading tier');
            const response = await axios.post(`${API_URL}/api/checkout/${apiId}`, {}, { withCredentials: true });

            const { url } = response.data;
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('No checkout URL received from server.');
            }
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            alert('An error occurred while setting up the payment process. Please try again.');
        } finally {
            setIsUpgrading(false);
        }
    };

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <p>Loading...</p>
            </div>
        );
    }

    if (isAuthenticated && userData) {
        const userTierPlan = pricingPlans.find((plan) => plan.tierId === userData.user.tier) ?? pricingPlans[0];

        const storageLimitBytes = userData.storage_limit;
        const storageUsedBytes = userData.storage_used;
        const storageUsedGB = storageUsedBytes / (1024 * 1024 * 1024);
        const storageLimitGB = storageLimitBytes > 0 ? storageLimitBytes / (1024 * 1024 * 1024) : 0;
        const storageUsedPercentage = storageLimitBytes > 0 ? (storageUsedBytes / storageLimitBytes) * 100 : 0;

        return (
            <div className='flex min-h-screen w-full flex-col bg-background/40 pt-14 sm:pt-20'>
                <main className='flex w-full flex-1 flex-col gap-8 p-4 sm:px-6 sm:py-0 max-w-6xl mx-auto'>
                    <header className='sm:py-4'>
                        <h1 className='text-2xl font-semibold'>Dashboard</h1>
                    </header>
                    <div className='flex flex-col gap-4'>
                        <header>
                            <h2 className='text-xl font-semibold'>Account Data</h2>
                        </header>
                        <div className='grid gap-6 md:grid-cols-2'>
                            <div className='flex flex-col gap-6'>
                                <StatCard title='Hosted Clips' value={userData.clip_count.toString()} />
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='text-base font-medium text-muted-foreground'>
                                            Storage Usage
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        <div className='flex items-baseline gap-2'>
                                            <p className='text-4xl font-bold tracking-tight'>
                                                {storageUsedGB.toFixed(2)} GB
                                            </p>
                                            <span className='text-muted-foreground'>
                                                / {storageLimitGB.toFixed(0)} GB used
                                            </span>
                                        </div>
                                        <Progress
                                            value={storageUsedPercentage}
                                            aria-label={`${storageUsedPercentage.toFixed(0)}% used`}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className='flex flex-col'>
                                <CardHeader>
                                    <CardTitle>Linked Account</CardTitle>
                                    <CardDescription>Your Wayclip account is connected to GitHub.</CardDescription>
                                </CardHeader>
                                <CardContent className='flex items-center gap-4'>
                                    <a
                                        href={`https://github.com/${userData.user.username}`}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        <Avatar className='h-12 w-12'>
                                            <AvatarImage src={userData.user.avatar_url ?? ''} alt='GitHub Avatar' />
                                            <AvatarFallback>
                                                {userData.user.username.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </a>
                                    <div>
                                        <p className='font-semibold text-lg'>{userData.user.username}</p>
                                        <p className='text-sm text-muted-foreground'>GitHub Account</p>
                                    </div>
                                </CardContent>
                                <CardFooter className='mt-auto flex gap-3 border-t pt-6'>
                                    <Button variant='outline' onClick={logout}>
                                        <LogOut className='mr-2 size-4' />
                                        Sign Out
                                    </Button>
                                    <Button variant='destructive' onClick={handleRemoveConnection}>
                                        <Unplug className='mr-2 size-4' />
                                        Remove Connection
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                    <div className='flex flex-col gap-4'>
                        <header>
                            <h2 className='text-xl font-semibold'>Manage Subscription</h2>
                            <p className='text-muted-foreground'>
                                You are currently on the{' '}
                                <span className='font-semibold text-primary'>{userTierPlan.name}</span> plan.
                            </p>
                        </header>
                        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                            {pricingPlans.map((plan) => (
                                <Card
                                    key={plan.name}
                                    className={cn(
                                        'flex flex-col',
                                        plan.isPopular && 'border-primary',
                                        plan.tierId === userData.user.tier && 'ring-2 ring-primary',
                                    )}
                                >
                                    <CardHeader>
                                        <div className='flex justify-between items-center'>
                                            <CardTitle>{plan.name}</CardTitle>
                                            {plan.isPopular && <Badge>Most Popular</Badge>}
                                        </div>
                                        <CardDescription>{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className='flex-1 space-y-4'>
                                        <div>
                                            <span className='text-4xl font-bold'>{plan.price}</span>
                                            <span className='text-muted-foreground'>{plan.priceFrequency}</span>
                                        </div>
                                        <ul className='space-y-2 text-sm'>
                                            {plan.features.map((feature) => (
                                                <li key={feature} className='flex items-center gap-2'>
                                                    <Check className='size-4 text-primary' />
                                                    <span className='text-muted-foreground'>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className='w-full'
                                            disabled={
                                                plan.tierId === userData.user.tier ||
                                                isUpgrading ||
                                                plan.tierId === 'free'
                                            }
                                            onClick={() => handleUpgrade(plan.apiId)}
                                        >
                                            {plan.tierId === userData.user.tier
                                                ? 'Current Plan'
                                                : isUpgrading
                                                  ? 'Processing...'
                                                  : 'Upgrade'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return null;
};

export default DashboardPage;
