'use client';

import { Copy, Trash2, ExternalLink, Check, LogOut, Unplug } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Clip } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/authContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogClose,
} from '@/components/ui/alert-dialog';
import axios from 'axios';

const API_URL = 'https://wayclip.com';

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

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const ClipsTable = ({
    clips,
    onDelete,
    onCopy,
}: {
    clips: Clip[];
    onDelete: (id: string) => void;
    onCopy: (url: string) => void;
}) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className='w-[40%]'>File Name</TableHead>
                    {'file_size' in clips[0] && <TableHead>Size</TableHead>}
                    {'created_at' in clips[0] && <TableHead>Uploaded</TableHead>}
                    <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clips.map((clip) => {
                    const clipUrl = `${API_URL}/clip/${clip.id}`;
                    return (
                        <TableRow key={clip.id}>
                            <TableCell className='font-medium truncate'>
                                <a
                                    href={clipUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='hover:underline flex items-center gap-2'
                                >
                                    {clip.file_name}
                                    <ExternalLink className='size-4 text-muted-foreground' />
                                </a>
                            </TableCell>
                            {'file_size' in clip && <TableCell>{formatBytes(clip.file_size)}</TableCell>}
                            {'created_at' in clip && (
                                <TableCell>{new Date(clip.created_at).toLocaleDateString()}</TableCell>
                            )}
                            <TableCell className='flex justify-end gap-2'>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() => onCopy(clipUrl)}
                                    className='cursor-pointer'
                                >
                                    <Copy className='size-4' />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger
                                        render={(props) => (
                                            <Button
                                                {...props}
                                                variant='destructive'
                                                size='icon'
                                                className='cursor-pointer'
                                            >
                                                <Trash2 className='size-4' />
                                            </Button>
                                        )}
                                    />
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. Your clip will be permanently deleted.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogClose
                                                render={(props) => (
                                                    <Button {...props} size='sm' variant='ghost'>
                                                        Cancel
                                                    </Button>
                                                )}
                                            />
                                            <Button size='sm' variant='destructive' onClick={() => onDelete(clip.id)}>
                                                Delete
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

const DashboardPage = () => {
    const { isAuthenticated, isLoading, user: userData, logout } = useAuth();
    const router = useRouter();
    const [clips, setClips] = useState<Clip[]>([]);
    const [clipsLoading, setClipsLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        const fetchClips = async () => {
            if (isAuthenticated) {
                try {
                    setClipsLoading(true);
                    const response = await axios.get<Clip[]>(`${API_URL}/api/clips/index`, { withCredentials: true });
                    setClips(response.data);
                } catch (error) {
                    console.error('Failed to fetch clips:', error);
                } finally {
                    setClipsLoading(false);
                }
            }
        };

        fetchClips();
    }, [isAuthenticated]);

    const handleDeleteClip = async (clipId: string) => {
        try {
            await axios.delete(`${API_URL}/api/clip/${clipId}`, { withCredentials: true });
            setClips((prevClips) => prevClips.filter((clip) => clip.id !== clipId));
        } catch (error) {
            console.error('Failed to delete clip:', error);
            toast.error('An error occurred while deleting the clip. Please try again.');
        }
    };

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
            const response = await axios.post(`${API_URL}/api/checkout/${apiId}`, {}, { withCredentials: true });
            const { url } = response.data;
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('No checkout URL received from server.');
            }
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            toast.error('An error occurred while setting up the payment process. Please try again.');
        } finally {
            setIsUpgrading(false);
        }
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard!');
    };

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <p>Loading...</p>
            </div>
        );
    }

    if (isAuthenticated && userData) {
        const userTierPlan = pricingPlans.find((p) => p.tierId === userData?.tier) ?? pricingPlans[0];

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
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='text-base font-medium text-muted-foreground'>
                                            Hosted Clips
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className='text-4xl font-bold tracking-tight'>{userData.clip_count}</p>

                                        {clipsLoading ? (
                                            <p>Loading clips...</p>
                                        ) : clips.length > 0 ? (
                                            <ClipsTable
                                                clips={clips}
                                                onDelete={handleDeleteClip}
                                                onCopy={handleCopyUrl}
                                            />
                                        ) : (
                                            <p className='text-muted-foreground'>
                                                You haven&apos;t uploaded any clips yet.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className='flex flex-col gap-6'>
                                <Card className='flex flex-col'>
                                    <CardHeader>
                                        <CardTitle>Linked Account</CardTitle>
                                        <CardDescription>Your Wayclip account is connected to GitHub.</CardDescription>
                                    </CardHeader>
                                    <CardContent className='flex items-center gap-4'>
                                        <a
                                            href={`https://github.com/${userData.username}`}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                        >
                                            <Avatar className='h-12 w-12'>
                                                <AvatarImage src={userData.avatar_url ?? ''} alt='GitHub Avatar' />
                                                <AvatarFallback>
                                                    {userData.username.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </a>
                                        <div>
                                            <p className='font-semibold text-lg'>{userData.username}</p>
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
                                            <span className='ml-auto text-3xl font-bold text-muted-foreground tracking-tight'>
                                                {Math.round((storageUsedGB / storageLimitGB) * 100)}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={storageUsedPercentage}
                                            aria-label={`${storageUsedPercentage.toFixed(0)}% used`}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col gap-4 mt-8'>
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
                                        plan.tierId === userData.tier && 'ring-2 ring-primary',
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
                                                plan.tierId === userData.tier || isUpgrading || plan.tierId === 'free'
                                            }
                                            onClick={() => handleUpgrade(plan.apiId)}
                                        >
                                            {plan.tierId === userData.tier
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
