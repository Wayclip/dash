'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios, { isAxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useConfig } from '@/contexts/configContext';

const InfoCard = ({
    title,
    description,
    buttonText,
    buttonHref,
}: {
    title: string;
    description: string;
    buttonText: string;
    buttonHref: string;
}) => (
    <Card className='w-full max-w-sm'>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild className='w-full'>
                <Link href={buttonHref}>{buttonText}</Link>
            </Button>
        </CardContent>
    </Card>
);

const ResetPasswordClientComponent = () => {
    const { config, isLoading: isConfigLoading } = useConfig();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleErrorToast = (error: unknown, defaultMessage: string) => {
        let message = defaultMessage;
        if (isAxiosError(error) && error.response?.data) {
            const serverMessage = error.response.data.message || error.response.data;
            if (typeof serverMessage === 'string' && serverMessage.length > 0) message = serverMessage;
        }
        toast.error(message);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        if (!token || !config?.apiUrl) {
            toast.error('Invalid request. Please try again.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(`${config.apiUrl}/auth/reset-password`, { token, password });
            toast.success(response.data.message || 'Your password has been reset successfully.');
            router.push('/login?reset_success=true');
        } catch (err) {
            handleErrorToast(err, 'Failed to reset password. The link may have expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isConfigLoading) {
        return <Loader2 className='h-12 w-12 animate-spin text-primary' />;
    }

    if (!config || !config.emailAuthEnabled) {
        return (
            <InfoCard
                title='Feature Disabled'
                description='Password reset via email is not enabled. Please contact support if you need assistance.'
                buttonText='Return to Login'
                buttonHref='/login'
            />
        );
    }

    if (!token) {
        return (
            <InfoCard
                title='Invalid Link'
                description='No reset token found. Please request a new password reset link from the login page.'
                buttonText='Return to Login'
                buttonHref='/login'
            />
        );
    }

    return (
        <Card className='w-full max-w-sm'>
            <CardHeader>
                <CardTitle>Reset Your Password</CardTitle>
                <CardDescription>Enter a new password for your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='grid gap-4'>
                    <div className='grid gap-2'>
                        <Label htmlFor='password'>New Password</Label>
                        <Input
                            id='password'
                            type='password'
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='At least 8 characters'
                        />
                    </div>
                    <div className='grid gap-2'>
                        <Label htmlFor='confirm-password'>Confirm New Password</Label>
                        <Input
                            id='confirm-password'
                            type='password'
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <Button type='submit' className='w-full' disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

const ResetPasswordPage = () => (
    <div className='flex min-h-screen w-full items-center justify-center bg-muted/40'>
        <Suspense fallback={<Loader2 className='h-12 w-12 animate-spin text-primary' />}>
            <ResetPasswordClientComponent />
        </Suspense>
    </div>
);

export default ResetPasswordPage;
