'use client';

import { Copy, Trash2, ExternalLink, Check, LogOut, Unplug, Shield, ShieldCheck, Key } from 'lucide-react';
import { InputOTP, InputOTPSlot, InputOTPGroup, InputOTPSeparator } from '@/components/ui/input-otp';
import AdminPanel from '@/components/panel';
import { toast } from 'sonner';
import { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { RefreshCcw } from 'lucide-react';
import { Clip } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { useAuth } from '@/contexts/authContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { BsGithub, BsGoogle, BsDiscord } from '@vertisanpro/react-icons/bs';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn, getPaymentInfo, ParsedPaymentInfo } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import axios from 'axios';

const LoadingScreen = () => (
    <div className='flex h-full min-h-screen w-full items-center justify-center bg-background/40'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent'></div>
    </div>
);

const providerIcons: { [key: string]: React.ReactNode } = {
    github: <BsGithub className='h-5 w-5' />,
    google: <BsGoogle className='h-5 w-5' />,
    discord: <BsDiscord className='h-5 w-5' />,
    email: <span className='text-xl font-bold'>@</span>,
};

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
    const api_url = process.env.NEXT_PUBLIC_API_URL;
    if (!clips || clips.length === 0) {
        return <p className='text-muted-foreground'>You haven&apos;t uploaded any clips yet.</p>;
    }

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
                    const clipUrl = `${api_url}/clip/${clip.id}`;
                    return (
                        <TableRow key={clip.id}>
                            <TableCell className='font-medium truncate max-w-xs'>
                                <a
                                    href={clipUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='hover:underline flex items-center gap-2'
                                >
                                    {clip.file_name}
                                    <ExternalLink className='size-4 text-muted-foreground flex-shrink-0' />
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
                                    aria-label='Copy clip URL'
                                >
                                    <Copy className='size-4' />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant='destructive'
                                            size='icon'
                                            className='cursor-pointer'
                                            aria-label='Delete clip'
                                        >
                                            <Trash2 className='size-4' />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. Your clip will be permanently deleted.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel asChild>
                                                <Button size='sm' variant='ghost' className='cursor-pointer'>
                                                    Cancel
                                                </Button>
                                            </AlertDialogCancel>
                                            <Button
                                                variant='destructive'
                                                onClick={() => onDelete(clip.id)}
                                                className='cursor-pointer'
                                            >
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

const ResetPasswordDialog = ({ onFinished }: { onFinished: () => void }) => {
    const api_url = process.env.NEXT_PUBLIC_API_URL;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${api_url}/auth/forgot-password`, { email });
            toast.success(response.data.message);
            onFinished();
        } catch (error) {
            if (isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to send password reset email.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='grid gap-4'>
            <div className='grid gap-2'>
                <Label htmlFor='reset-email'>Email</Label>
                <Input
                    id='reset-email'
                    type='email'
                    placeholder='me@example.com'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <Button type='submit' className='w-full' disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Password Reset Link'}
            </Button>
        </form>
    );
};

const TwoFactorSetup = ({ onSuccess }: { onSuccess: () => void }) => {
    const api_url = process.env.NEXT_PUBLIC_API_URL;
    const [step, setStep] = useState<'setup' | 'verify'>('setup');
    const [secret, setSecret] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const initiate2FA = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${api_url}/api/2fa/setup`, {}, { withCredentials: true });
            setSecret(response.data.secret);
            setQrCodeUrl(response.data.qr_code_base64);
            setStep('verify');
        } catch (error) {
            toast.error('Failed to initialize 2FA setup.');
            console.error('2FA setup failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const verify2FA = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${api_url}/api/2fa/verify`,
                {
                    secret: secret,
                    code: verificationCode,
                },
                { withCredentials: true },
            );
            setRecoveryCodes(response.data.recovery_codes);
            toast.success('2FA enabled successfully!');
        } catch (error) {
            if (isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Invalid verification code. Please try again.');
            }
            console.error('2FA verification failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyAndClose = () => {
        navigator.clipboard.writeText(recoveryCodes.join('\n'));
        toast.success('Recovery codes copied to clipboard!');
        onSuccess();
    };

    if (recoveryCodes.length > 0) {
        return (
            <div className='space-y-4'>
                <div className='text-center'>
                    <ShieldCheck className='mx-auto h-12 w-12 text-green-500' />
                    <h3 className='text-lg font-semibold'>2FA Enabled Successfully!</h3>
                </div>
                <div className='space-y-2'>
                    <Label>Recovery Codes</Label>
                    <p className='text-sm text-muted-foreground'>
                        Save these recovery codes in a safe place. You can use them to access your account if you lose
                        your 2FA device.
                    </p>
                    <div className='grid grid-cols-2 gap-2 p-4 bg-muted rounded'>
                        {recoveryCodes.map((code, index) => (
                            <div key={index} className='font-mono text-sm'>
                                {index + 1}. {code}
                            </div>
                        ))}
                    </div>
                </div>
                <Button onClick={handleCopyAndClose} className='w-full cursor-pointer'>
                    <Copy className='mr-2 h-4 w-4' />
                    Copy Codes & Close
                </Button>
            </div>
        );
    }

    if (step === 'verify') {
        return (
            <div className='space-y-4'>
                <div>
                    <h3 className='text-lg font-semibold'>Scan QR Code</h3>
                    <p className='text-sm text-muted-foreground'>
                        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                </div>
                <div className='flex justify-center p-4 bg-white rounded-lg'>
                    {qrCodeUrl && <Image src={qrCodeUrl} alt='2FA QR Code' width={200} height={200} />}
                </div>
                <div className='space-y-2'>
                    <Label>Manual Entry Key (if needed)</Label>
                    <Input value={secret} readOnly className='font-mono text-xs' />
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='verification-code'>Enter Verification Code</Label>
                    <div className='flex justify-center'>
                        <InputOTP
                            maxLength={6}
                            value={verificationCode}
                            onChange={(value) => setVerificationCode(value)}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                </div>
                <Button
                    onClick={verify2FA}
                    disabled={isLoading || verificationCode.length !== 6}
                    className='w-full cursor-pointer'
                >
                    {isLoading ? 'Verifying...' : 'Enable 2FA'}
                </Button>
            </div>
        );
    }

    return (
        <div className='space-y-4'>
            <div className='text-center'>
                <Shield className='mx-auto h-12 w-12 text-blue-500' />
                <h3 className='text-lg font-semibold'>Enable Two-Factor Authentication</h3>
                <p className='text-sm text-muted-foreground'>
                    Add an extra layer of security to your account with 2FA.
                </p>
            </div>
            <Button onClick={initiate2FA} disabled={isLoading} className='w-full'>
                {isLoading ? 'Setting up...' : 'Start Setup'}
            </Button>
        </div>
    );
};

const DashboardPage = () => {
    const api_url = process.env.NEXT_PUBLIC_API_URL;
    const { isAuthenticated, isLoading, user: userData, logout, refreshUser } = useAuth();
    const router = useRouter();
    const [clips, setClips] = useState<Clip[]>([]);
    const [clipsLoading, setClipsLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [show2FADialog, setShow2FADialog] = useState(false);
    const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
    const [isManagingSubscription, setIsManagingSubscription] = useState(false);
    const [paymentData, setPaymentData] = useState<ParsedPaymentInfo | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        const fetchPaymentData = async () => {
            const data = await getPaymentInfo();
            setPaymentData(data);
        };
        const fetchClips = async () => {
            if (isAuthenticated) {
                try {
                    setClipsLoading(true);
                    const response = await axios.get<Clip[]>(`${api_url}/api/clips/index`, { withCredentials: true });
                    setClips(response.data);
                } catch (error) {
                    console.error('Failed to fetch clips:', error);
                    toast.error('Could not load your clips. Please try refreshing the page.');
                } finally {
                    setClipsLoading(false);
                }
            }
        };

        fetchClips();
        fetchPaymentData();
    }, [isAuthenticated, api_url]);

    const handleUnlinkProvider = async (provider: string) => {
        try {
            await axios.delete(`${api_url}/api/oauth/unlink/${provider}`, { withCredentials: true });
            toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked successfully.`);
            await refreshUser();
        } catch (error) {
            if (isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('An unexpected error occurred.');
            }
            console.error(`Failed to unlink ${provider}:`, error);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await axios.delete(`${api_url}/api/account`, { withCredentials: true });
            toast.success(response.data.message || 'Your account has been scheduled for deletion.');
            logout();
        } catch (error) {
            if (isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to delete account. Please try again.');
            }
            console.error('Account deletion failed:', error);
        }
    };

    const handleDeleteClip = async (clipId: string) => {
        try {
            await axios.delete(`${api_url}/api/clip/${clipId}`, { withCredentials: true });
            setClips((prevClips) => prevClips.filter((clip) => clip.id !== clipId));
            toast.success('Clip deleted successfully.');
            await refreshUser();
        } catch (error) {
            console.error('Failed to delete clip:', error);
            toast.error('An error occurred while deleting the clip. Please try again.');
        }
    };

    const handleUpgrade = async (apiId: string | null) => {
        if (!apiId) return;
        setIsUpgrading(true);
        try {
            const response = await axios.post(`${api_url}/api/checkout/${apiId}`, {}, { withCredentials: true });
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

    const handleManageSubscription = async () => {
        setIsManagingSubscription(true);
        try {
            const response = await axios.post(`${api_url}/api/customer-portal`, {}, { withCredentials: true });
            const { url } = response.data;
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('No portal URL received from server.');
            }
        } catch (error) {
            toast.error('Could not open the billing portal. Please try again.');
            console.error('Failed to create customer portal session:', error);
        } finally {
            setIsManagingSubscription(false);
        }
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard!');
    };

    const handle2FASuccess = () => {
        setShow2FADialog(false);
        refreshUser();
    };

    // const handleLogoutOtherDevices = async () => {
    //     try {
    //         const response = await axios.post(`${api_url}/api/logout-devices`, {}, { withCredentials: true });
    //         toast.success(response.data.message || 'Successfully logged out other devices.');
    //     } catch (error) {
    //         if (isAxiosError(error) && error.response?.data?.message) {
    //             toast.error(error.response.data.message);
    //         } else {
    //             toast.error('Failed to log out other devices.');
    //         }
    //     }
    // };

    if (isLoading || !isAuthenticated || !userData) {
        return <LoadingScreen />;
    }

    const userTierPlan =
        paymentData?.active_tiers.find((p) => p.name === userData?.tier) ?? paymentData?.active_tiers[0];
    const storageLimitBytes = userData.storage_limit;
    const storageUsedBytes = userData.storage_used;
    const storageUsedGB = storageUsedBytes / (1024 * 1024 * 1024);
    const storageLimitGB = storageLimitBytes > 0 ? storageLimitBytes / (1024 * 1024 * 1024) : 0;
    const storageUsedPercentage = storageLimitBytes > 0 ? (storageUsedBytes / storageLimitBytes) * 100 : 0;
    const isEmailVerified = userData.email_verified_at !== null && userData.email_verified_at !== undefined;

    return (
        <div className='flex w-full flex-col bg-background/40 pt-14 sm:pt-20'>
            <main className='flex w-full flex-1 flex-col gap-8 p-4 sm:px-6 sm:py-0 max-w-6xl mx-auto'>
                <header className='sm:py-4'>
                    <h1 className='text-2xl font-semibold'>Dashboard</h1>
                </header>

                {userData.role === 'admin' && (
                    <div className='mb-8 flex flex-col gap-2'>
                        <header>
                            <h2 className='text-xl font-semibold'>Admin Panel</h2>
                        </header>
                        <AdminPanel />
                    </div>
                )}

                <div className='flex flex-col gap-4'>
                    <header>
                        <h2 className='text-xl font-semibold'>Account Data</h2>
                    </header>
                    <div className='grid lg:grid-cols-3 gap-6'>
                        <Card className='flex flex-col'>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                                <CardDescription>Manage your account details and security settings.</CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='flex flex-col sm:flex-row gap-6 sm:gap-12'>
                                    <div className='flex items-center gap-4'>
                                        <Avatar className='h-12 w-12'>
                                            <AvatarImage src={userData.avatar_url ?? ''} alt='Avatar' />
                                            <AvatarFallback>{userData.username.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className='font-semibold text-lg'>{userData.username}</p>
                                        </div>
                                    </div>

                                    {userData.email && (
                                        <div className='space-y-1'>
                                            <p className='text-sm font-medium'>Email</p>
                                            <div className='flex items-center gap-2'>
                                                <p className='text-sm'>{userData.email}</p>
                                                <Badge variant={isEmailVerified ? 'default' : 'destructive'}>
                                                    {isEmailVerified ? 'Verified' : 'Not Verified'}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    <div className='space-y-1'>
                                        <p className='text-sm font-medium'>Two-Factor Authentication</p>
                                        <div className='flex items-center gap-2'>
                                            <Badge
                                                variant={userData.two_factor_enabled ? 'default' : 'secondary'}
                                                className='flex items-center gap-1'
                                            >
                                                {userData.two_factor_enabled ? (
                                                    <ShieldCheck className='h-3 w-3' />
                                                ) : (
                                                    <Shield className='h-3 w-3' />
                                                )}
                                                {userData.two_factor_enabled ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-3'>
                                    <Label>Connected Accounts</Label>
                                    <p className='text-sm text-muted-foreground'>
                                        These are the services you can use to sign in.
                                    </p>
                                    <div className='space-y-2'>
                                        {userData.connected_accounts.map((provider) => (
                                            <div
                                                key={provider}
                                                className='flex items-center justify-between rounded-md border p-3'
                                            >
                                                <div className='flex items-center gap-3'>
                                                    {providerIcons[provider]}
                                                    <span className='font-medium capitalize'>{provider}</span>
                                                </div>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            disabled={userData.connected_accounts.length <= 1}
                                                            className='text-xs cursor-pointer'
                                                        >
                                                            <Unplug className='mr-2 h-3 w-3' />
                                                            Unlink
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Unlink {provider}?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure? You will no longer be able to log in using
                                                                this {provider} account.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel asChild>
                                                                <Button
                                                                    size='sm'
                                                                    variant='ghost'
                                                                    className='cursor-pointer'
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </AlertDialogCancel>
                                                            <Button
                                                                onClick={() => handleUnlinkProvider(provider)}
                                                                className='cursor-pointer'
                                                            >
                                                                Continue
                                                            </Button>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className='mt-auto flex flex-wrap gap-2 border-t pt-6'>
                                <Button variant='outline' onClick={logout} className='cursor-pointer'>
                                    <LogOut className='mr-2 size-4' />
                                    Sign Out
                                </Button>
                                {!userData.two_factor_enabled && (
                                    <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                                        <DialogTrigger asChild>
                                            <Button className='cursor-pointer'>
                                                <Key className='mr-2 size-4' />
                                                Enable 2FA
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className='sm:max-w-md'>
                                            <DialogHeader>
                                                <DialogTitle>Two-Factor Authentication</DialogTitle>
                                                <DialogDescription>
                                                    Secure your account by requiring a second verification step.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <TwoFactorSetup onSuccess={handle2FASuccess} />
                                        </DialogContent>
                                    </Dialog>
                                )}
                                {userData.connected_accounts.includes('email') && (
                                    <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
                                        <DialogTrigger asChild>
                                            <Button variant='outline' className='cursor-pointer'>
                                                <RefreshCcw className='mr-2 size-4' />
                                                Reset Password
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className='sm:max-w-md'>
                                            <DialogHeader>
                                                <DialogTitle>Reset Your Password</DialogTitle>
                                                <DialogDescription>
                                                    Enter your email to receive a password reset link.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ResetPasswordDialog onFinished={() => setShowResetPasswordDialog(false)} />
                                        </DialogContent>
                                    </Dialog>
                                )}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant='destructive' className='cursor-pointer'>
                                            <Trash2 className='mr-2 size-4' />
                                            Delete Account
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action is irreversible. All your data, including your clips, will
                                                be permanently deleted. This cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel asChild>
                                                <Button size='sm' variant='ghost' className='cursor-pointer'>
                                                    Cancel
                                                </Button>
                                            </AlertDialogCancel>
                                            <Button
                                                variant='destructive'
                                                onClick={handleDeleteAccount}
                                                className='cursor-pointer'
                                            >
                                                Yes, delete my account
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                        {/*
                        TODO: Rework to actually be useful, this is just bs
                        <Card className='flex flex-col'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Clock className='size-5' />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription>Your last known login.</CardDescription>
                            </CardHeader>
                            <CardContent className='flex-1 flex flex-col'>
                                {userData.last_login_at && userData.last_login_ip ? (
                                    <div className='text-sm text-muted-foreground space-y-2 h-full'>
                                        <div>
                                            <p className='font-medium text-foreground'>Last Login Time</p>
                                            <p>{new Date(userData.last_login_at).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className='font-medium text-foreground'>IP Address</p>
                                            <p>{userData.last_login_ip}</p>
                                        </div>
                                        <p className='mt-auto text-xs text-muted-foreground'>
                                            If you don&apos;t recognize this activity, please reset your password.
                                        </p>
                                    </div>
                                ) : (
                                    <p className='text-sm text-muted-foreground'>No recent login activity to show.</p>
                                )}
                            </CardContent>
                            <CardFooter className='mt-auto flex flex-wrap gap-2 border-t pt-6'>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant='outline' className='cursor-pointer'>
                                            <LogOutIcon className='mr-2 size-4' />
                                            Sign Out Other Devices
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Sign out everywhere else?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will sign you out of all other active sessions on other browsers
                                                and devices. Your current session will remain active.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <Button onClick={handleLogoutOtherDevices}>Continue</Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card> */}
                    </div>

                    <div className='flex flex-col gap-4'>
                        <div className='grid grid-cols-5 gap-6 w-full'>
                            <Card className='col-span-4 w-full'>
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
                                            / {storageLimitGB > 0 ? `${storageLimitGB.toFixed(0)} GB` : '2 GB'} used
                                        </span>
                                    </div>
                                    <Progress
                                        value={storageUsedPercentage}
                                        aria-label={`${storageUsedPercentage.toFixed(0)}% used`}
                                    />
                                </CardContent>
                            </Card>
                            <Card className='col-span-1 w-full'>
                                <CardHeader>
                                    <CardTitle className='text-base font-medium text-muted-foreground'>
                                        Hosted Clips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-4xl font-bold tracking-tight'>{userData.clip_count}</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Your Clips</CardTitle>
                                <CardDescription>Manage your uploaded clips.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {clipsLoading ? (
                                    <div className='flex justify-center py-8'>
                                        <div className='h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent' />
                                    </div>
                                ) : (
                                    <ClipsTable clips={clips} onDelete={handleDeleteClip} onCopy={handleCopyUrl} />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className='flex flex-col gap-4 mb-8 mt-4'>
                    <header>
                        <h2 className='text-xl font-semibold'>Billing & Subscriptions</h2>
                    </header>
                    {userData.tier !== 'free' ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Subscription</CardTitle>
                                <CardDescription>
                                    You are currently on the{' '}
                                    <span className='font-semibold text-primary'>{userTierPlan?.name ?? 'Error'}</span>{' '}
                                    plan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className='text-sm text-muted-foreground'>
                                    Manage your billing information, switch plans, or cancel your subscription at any
                                    time through our secure billing portal.
                                </p>
                            </CardContent>
                            <CardFooter className='flex flex-wrap gap-2'>
                                <Button
                                    onClick={handleManageSubscription}
                                    disabled={isManagingSubscription}
                                    className='cursor-pointer'
                                >
                                    <ExternalLink className='mr-2 size-4' />
                                    {isManagingSubscription ? 'Redirecting...' : 'Manage Billing'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <header>
                            <h2 className='text-xl font-semibold'>Manage Subscription</h2>
                            <p className='text-muted-foreground'>
                                You are currently on the{' '}
                                <span className='font-semibold text-primary'>{userTierPlan?.name}</span> plan.
                            </p>
                        </header>
                    )}
                    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-16'>
                        {paymentData?.active_tiers.map((plan) => (
                            <Card
                                key={plan.name}
                                className={cn(
                                    'flex flex-col',
                                    plan.is_popular && 'border-primary',
                                    plan.name === userData.tier && 'ring-2 ring-primary',
                                )}
                            >
                                <CardHeader>
                                    <div className='flex justify-between items-center'>
                                        <CardTitle>{plan.name}</CardTitle>
                                        {plan.is_popular && <Badge>Most Popular</Badge>}
                                    </div>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className='flex-1 space-y-4'>
                                    <div>
                                        <span className='text-4xl font-bold'>{plan.display_price}</span>
                                        <span className='text-muted-foreground'>{plan.display_frequency}</span>
                                    </div>
                                    <ul className='space-y-2 text-sm'>
                                        {plan.display_features.map((feature) => (
                                            <li key={feature} className='flex items-center gap-2'>
                                                <Check className='size-4 text-primary' />
                                                <span className='text-muted-foreground'>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    {userData.tier === 'free' ? (
                                        <Button
                                            className='w-full cursor-pointer'
                                            disabled={
                                                plan.name === userData.tier || isUpgrading || plan.name === 'free'
                                            }
                                            onClick={() => handleUpgrade(plan.name)}
                                        >
                                            {plan.name === userData.tier
                                                ? 'Current Plan'
                                                : isUpgrading
                                                  ? 'Processing...'
                                                  : 'Manage plan'}
                                        </Button>
                                    ) : (
                                        <Button
                                            className='w-full cursor-pointer'
                                            disabled={plan.name === userData.tier}
                                            onClick={handleManageSubscription}
                                        >
                                            {plan.name === userData.tier ? 'Current Plan' : 'Manage Plan'}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
