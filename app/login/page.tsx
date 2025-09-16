'use client';

import { Suspense, useEffect, useState, FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { BsDiscord, BsGoogle, BsGithub } from '@vertisanpro/react-icons/bs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/authContext';
import { useRouter, useSearchParams } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';

const LoadingScreen = () => (
    <div className='flex h-screen w-full items-center justify-center bg-background/40'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent'></div>
    </div>
);

const API_URL = 'https://wayclip.com';

const LoginClientComponent = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [twoFAToken, setTwoFAToken] = useState('');
    const [twoFACode, setTwoFACode] = useState('');
    const [is2FASubmitting, setIs2FASubmitting] = useState(false);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/dash');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        const verified = searchParams.get('verified');
        if (verified === 'true') {
            toast.success('Email verified successfully! You can now log in.');
            router.replace('/login');
        }
        const reset = searchParams.get('reset_success');
        if (reset === 'true') {
            toast.success('Password has been reset successfully. Please log in.');
            router.replace('/login');
        }
        const error = searchParams.get('error');
        if (error) {
            toast.error(error);
            router.replace('/login');
        }
    }, [searchParams, router]);

    const handleOAuthLogin = (provider: 'github' | 'google' | 'discord') => {
        if (!API_URL) {
            toast.error('Configuration error: The API URL is not set.');
            return;
        }
        const finalRedirectUri = window.location.origin + '/dash';
        const loginUrl = `${API_URL}/auth/${provider}?redirect_uri=${encodeURIComponent(finalRedirectUri)}`;
        window.location.href = loginUrl;
    };

    const handleErrorToast = (error: unknown, defaultMessage: string) => {
        if (isAxiosError(error) && error.response?.data) {
            const serverMessage = error.response.data;
            // Handle cases where the response body is a string or an object with a 'message' property
            if (typeof serverMessage === 'string' && serverMessage.length > 0) {
                toast.error(serverMessage);
            } else if (
                serverMessage.message &&
                typeof serverMessage.message === 'string' &&
                serverMessage.message.length > 0
            ) {
                toast.error(serverMessage.message);
            } else {
                toast.error(defaultMessage);
            }
        } else {
            toast.error(defaultMessage);
        }
    };

    const handlePasswordLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `${API_URL}/auth/login`,
                { email, password },
                {
                    withCredentials: true,
                },
            );

            if (response.status === 200 && response.data.success) {
                window.location.href = '/dash';
            } else if (response.data['2fa_required']) {
                setTwoFAToken(response.data['2fa_token']);
                setShow2FA(true);
                toast.info('Please enter your 2FA code to complete login.');
            }
        } catch (error) {
            if (isAxiosError(error) && error.response?.data?.error_code === 'EMAIL_NOT_VERIFIED') {
                toast.error(error.response.data.message, {
                    action: {
                        label: 'Resend Email',
                        onClick: () => handleResendVerification(email),
                    },
                    duration: 10000,
                });
            } else {
                handleErrorToast(error, 'Login failed. Please check your credentials.');
            }
            console.error('Password login failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handle2FALogin = async (e: FormEvent) => {
        e.preventDefault();
        setIs2FASubmitting(true);
        try {
            const response = await axios.post(
                `${API_URL}/auth/2fa/authenticate`,
                {
                    '2fa_token': twoFAToken,
                    code: twoFACode,
                },
                {
                    withCredentials: true,
                },
            );

            if (response.data.success) {
                window.location.href = '/dash';
            }
        } catch (error) {
            handleErrorToast(error, 'Invalid 2FA code. Please try again.');
            console.error('2FA login failed:', error);
        } finally {
            setIs2FASubmitting(false);
        }
    };

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();

        if (registerPassword !== registerConfirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        if (registerPassword.length < 8) {
            toast.error('Password must be at least 8 characters long.');
            return;
        }

        setIsRegistering(true);
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                username: registerUsername,
                email: registerEmail,
                password: registerPassword,
            });

            toast.success(
                response.data.message || 'Registration successful! Please check your email to verify your account.',
            );
            setActiveTab('login');
            setRegisterEmail('');
            setRegisterUsername('');
            setRegisterPassword('');
            setRegisterConfirmPassword('');
        } catch (error) {
            handleErrorToast(error, 'Registration failed. Please try again.');
            console.error('Registration failed:', error);
        } finally {
            setIsRegistering(false);
        }
    };

    const handleResendVerification = async (email: string) => {
        if (!email) {
            toast.error('Please enter your email address in the login form first.');
            return;
        }
        try {
            const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
            toast.success(response.data.message);
        } catch (error) {
            handleErrorToast(error, 'Failed to send verification email.');
            console.error(error);
        }
    };

    const handleForgotPassword = (e: FormEvent) => {
        e.preventDefault();
        router.push('/reset-password');
    };

    if (isLoading || isAuthenticated) {
        return <LoadingScreen />;
    }

    if (show2FA) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-background/40'>
                <Card className='w-full max-w-sm'>
                    <CardHeader className='text-center'>
                        <CardTitle className='text-2xl flex items-center justify-center gap-2'>
                            <KeyRound className='h-6 w-6' />
                            Two-Factor Authentication
                        </CardTitle>
                        <CardDescription>
                            Enter the code from your authenticator app or a recovery code.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handle2FALogin} className='grid gap-4'>
                            <div className='grid gap-2'>
                                <Label htmlFor='twofa-code'>Authentication Code</Label>
                                <Input
                                    id='twofa-code'
                                    type='text'
                                    placeholder='000000 or recovery code'
                                    required
                                    value={twoFACode}
                                    onChange={(e) => setTwoFACode(e.target.value)}
                                    className='text-center text-lg tracking-widest'
                                />
                            </div>
                            <Button type='submit' className='w-full' disabled={is2FASubmitting}>
                                {is2FASubmitting ? 'Verifying...' : 'Verify Code'}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='w-full'
                                onClick={() => setShow2FA(false)}
                            >
                                Back to Login
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-background/40'>
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <CardTitle className='text-2xl'>Welcome to Wayclip</CardTitle>
                    <CardDescription>Sign in to your account or create a new one.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='login'>Login</TabsTrigger>
                            <TabsTrigger value='register'>Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value='login' className='space-y-4 mt-4'>
                            <div className='grid gap-4'>
                                <Button
                                    onClick={() => handleOAuthLogin('github')}
                                    className='w-full'
                                    disabled={isLoading}
                                >
                                    <BsGithub className='mr-2 h-4 w-4' /> Continue with GitHub
                                </Button>
                                <Button
                                    onClick={() => handleOAuthLogin('google')}
                                    className='w-full'
                                    disabled={isLoading}
                                    variant='outline'
                                >
                                    <BsGoogle className='mr-2 h-4 w-4' /> Continue with Google
                                </Button>
                                <Button
                                    onClick={() => handleOAuthLogin('discord')}
                                    disabled={isLoading}
                                    style={{ backgroundColor: '#5865F2', color: 'white' }}
                                    className='hover:bg-blue-600 w-full'
                                >
                                    <BsDiscord className='mr-2 h-4 w-4' /> Continue with Discord
                                </Button>

                                <div className='relative'>
                                    <div className='absolute inset-0 flex items-center'>
                                        <span className='w-full border-t' />
                                    </div>
                                    <div className='relative flex justify-center text-xs uppercase'>
                                        <span className='px-2 text-muted-foreground'>Or continue with email</span>
                                    </div>
                                </div>

                                <form onSubmit={handlePasswordLogin} className='grid gap-4'>
                                    <div className='grid gap-2'>
                                        <Label htmlFor='email'>Email</Label>
                                        <Input
                                            id='email'
                                            type='email'
                                            placeholder='me@example.com'
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className='grid gap-2'>
                                        <div className='flex items-center'>
                                            <Label htmlFor='password'>Password</Label>
                                            <Button
                                                type='button'
                                                variant='link'
                                                className='ml-auto h-auto p-0 text-sm'
                                                onClick={handleForgotPassword}
                                            >
                                                Forgot password?
                                            </Button>
                                        </div>
                                        <Input
                                            id='password'
                                            type='password'
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    <Button type='submit' className='w-full' disabled={isSubmitting}>
                                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </form>
                            </div>
                        </TabsContent>

                        <TabsContent value='register' className='space-y-4 mt-4'>
                            <div className='grid gap-4'>
                                <Button
                                    onClick={() => handleOAuthLogin('github')}
                                    className='w-full'
                                    disabled={isLoading}
                                >
                                    <BsGithub className='mr-2 h-4 w-4' /> Continue with GitHub
                                </Button>
                                <Button
                                    onClick={() => handleOAuthLogin('google')}
                                    className='w-full'
                                    disabled={isLoading}
                                    variant='outline'
                                >
                                    <BsGoogle className='mr-2 h-4 w-4' /> Continue with Google
                                </Button>
                                <Button
                                    onClick={() => handleOAuthLogin('discord')}
                                    disabled={isLoading}
                                    style={{ backgroundColor: '#5865F2', color: 'white' }}
                                    className='hover:bg-blue-600 w-full'
                                >
                                    <BsDiscord className='mr-2 h-4 w-4' /> Continue with Discord
                                </Button>

                                <div className='relative'>
                                    <div className='absolute inset-0 flex items-center'>
                                        <span className='w-full border-t' />
                                    </div>
                                    <div className='relative flex justify-center text-xs uppercase'>
                                        <span className='px-2 text-muted-foreground'>Or register with email</span>
                                    </div>
                                </div>

                                <form onSubmit={handleRegister} className='grid gap-4'>
                                    <div className='grid gap-2'>
                                        <Label htmlFor='register-username'>Username</Label>
                                        <Input
                                            id='register-username'
                                            type='text'
                                            placeholder='johndoe'
                                            required
                                            value={registerUsername}
                                            onChange={(e) => setRegisterUsername(e.target.value)}
                                        />
                                    </div>
                                    <div className='grid gap-2'>
                                        <Label htmlFor='register-email'>Email</Label>
                                        <Input
                                            id='register-email'
                                            type='email'
                                            placeholder='me@example.com'
                                            required
                                            value={registerEmail}
                                            onChange={(e) => setRegisterEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className='grid gap-2'>
                                        <Label htmlFor='register-password'>Password</Label>
                                        <Input
                                            id='register-password'
                                            type='password'
                                            placeholder='At least 8 characters'
                                            required
                                            minLength={8}
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className='grid gap-2'>
                                        <Label htmlFor='register-confirm-password'>Confirm Password</Label>
                                        <Input
                                            id='register-confirm-password'
                                            type='password'
                                            placeholder='Confirm your password'
                                            required
                                            value={registerConfirmPassword}
                                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                    <Button type='submit' className='w-full' disabled={isRegistering}>
                                        {isRegistering ? 'Creating account...' : 'Create Account'}
                                    </Button>
                                </form>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

const LoginPage = () => {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <LoginClientComponent />
        </Suspense>
    );
};

export default LoginPage;
