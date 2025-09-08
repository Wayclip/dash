'use client';

import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/dash');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleLogin = () => {
        if (!API_URL) {
            alert('Configuration error: The API URL is not set. Please contact the administrator.');
            return;
        }

        const finalRedirectUri = window.location.origin + '/dash';
        const loginUrl = `${API_URL}/auth/github?redirect_uri=${encodeURIComponent(finalRedirectUri)}`;

        window.location.href = loginUrl;
    };

    if (!isLoading && isAuthenticated) {
        return null;
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-background/40'>
            <Card className='w-full max-w-sm'>
                <CardHeader className='text-center'>
                    <CardTitle className='text-2xl'>Welcome to Wayclip</CardTitle>
                    <CardDescription>Sign in with your GitHub account to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleLogin} className='w-full' disabled={isLoading}>
                        {isLoading ? (
                            'Loading...'
                        ) : (
                            <>
                                <Github className='mr-2 h-4 w-4' /> Login with GitHub
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
