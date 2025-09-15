import { Suspense } from 'react';
import { PaymentVerificationClient } from '@/components/payment';
import { Loader2 } from 'lucide-react';

const PaymentVerificationPage = () => {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <PaymentVerificationClient />
        </Suspense>
    );
};

const LoadingSpinner = () => (
    <div className='flex min-h-screen w-full items-center justify-center'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
    </div>
);

export default PaymentVerificationPage;
