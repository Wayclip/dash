'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

const PaymentCancelPage = () => {
    return (
        <div className='flex min-h-screen w-full items-center justify-center bg-muted/40'>
            <Card className='w-full max-w-md text-center'>
                <CardHeader>
                    <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10'>
                        <XCircle className='h-10 w-10 text-destructive' />
                    </div>
                    <CardTitle className='mt-4 text-2xl'>Payment Canceled</CardTitle>
                    <CardDescription>
                        Your checkout session has been canceled. You have not been charged.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href='/dashboard'>
                        <Button className='w-full'>Return to Dashboard</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentCancelPage;
