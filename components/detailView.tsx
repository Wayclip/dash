'use client';

import { useCallback, useEffect, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogClose,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/authContext';

const API_URL = 'https://wayclip.com';

type UserRole = 'User' | 'Admin';
type SubscriptionTier = 'free' | 'tier1' | 'tier2' | 'tier3';
interface FullUserDetails {
    id: string;
    username: string;
    email: string | null;
    avatarUrl: string | null;
    tier: SubscriptionTier;
    role: UserRole;
    isBanned: boolean;
    createdAt: string;
    deletedAt: string | null;
    emailVerifiedAt: string | null;
    twoFactorEnabled: boolean;
    subscriptionStatus: string | null;
    currentPeriodEnd: string | null;
    connectedProviders: string[];
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <p className='text-sm font-medium text-muted-foreground'>{label}</p>
        <div className='text-base'>{value || <span className='text-muted-foreground'>N/A</span>}</div>
    </div>
);

export const UserDetailView = ({ userId, onDataChange }: { userId: string; onDataChange: () => void }) => {
    const { user: adminUser } = useAuth();
    const [details, setDetails] = useState<FullUserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDetails = useCallback(async () => {
        try {
            const response = await axios.get<FullUserDetails>(`${API_URL}/admin/users/${userId}`, {
                withCredentials: true,
            });
            setDetails(response.data);
        } catch (error) {
            toast.error(`Failed to fetch user details, ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchDetails();
    }, [userId, fetchDetails]);

    const handleAction = async (action: () => Promise<unknown>, successMessage: string) => {
        try {
            await action();
            toast.success(successMessage);
            await fetchDetails();
            onDataChange();
        } catch (error) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'An error occurred.');
            }
        }
    };

    const handleUpdateRole = (role: UserRole) => {
        if (adminUser?.id === userId) {
            toast.error('You cannot change your own role.');
            return;
        }
        handleAction(
            () =>
                axios.post(
                    `${API_URL}/admin/users/${userId}/role`,
                    { role: role.toLowerCase() },
                    { withCredentials: true },
                ),
            'User role updated.',
        );
    };

    const handleUpdateTier = (tier: SubscriptionTier) => {
        handleAction(
            () => axios.post(`${API_URL}/admin/users/${userId}/tier`, { tier }, { withCredentials: true }),
            'User tier manually updated.',
        );
    };

    const handleUnban = () => {
        handleAction(
            () => axios.post(`${API_URL}/admin/users/${userId}/unban`, {}, { withCredentials: true }),
            'User has been unbanned.',
        );
    };

    if (isLoading)
        return (
            <div className='flex justify-center items-center p-6'>
                <Loader2 className='animate-spin' />
            </div>
        );
    if (!details) return <p className='p-6 text-destructive'>Could not load user details.</p>;

    return (
        <div className='p-4 bg-muted space-y-6'>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                <DetailItem label='User ID' value={<pre className='text-xs'>{details.id}</pre>} />
                <DetailItem label='Email' value={details.email} />
                <DetailItem label='Joined At' value={new Date(details.createdAt).toLocaleString()} />
                <DetailItem
                    label='Email Verified'
                    value={
                        details.emailVerifiedAt ? (
                            new Date(details.emailVerifiedAt).toLocaleString()
                        ) : (
                            <Badge variant='secondary'>No</Badge>
                        )
                    }
                />
                <DetailItem
                    label='2FA Enabled'
                    value={details.twoFactorEnabled ? <Badge>Yes</Badge> : <Badge variant='secondary'>No</Badge>}
                />
                <DetailItem
                    label='Subscription Status'
                    value={details.subscriptionStatus ? <Badge>{details.subscriptionStatus}</Badge> : null}
                />
                <DetailItem
                    label='Period End'
                    value={details.currentPeriodEnd ? new Date(details.currentPeriodEnd).toLocaleDateString() : null}
                />
                <DetailItem
                    label='Auth Methods'
                    value={
                        <div className='flex gap-1 flex-wrap'>
                            {details.connectedProviders.map((p) => (
                                <Badge key={p} variant='outline'>
                                    {p}
                                </Badge>
                            ))}
                        </div>
                    }
                />
            </div>
            <div className='flex flex-wrap items-end gap-4 pt-4 border-t'>
                <div className='space-y-2'>
                    <Label>Change Role</Label>
                    <Select
                        onValueChange={(value: UserRole) => handleUpdateRole(value)}
                        defaultValue={details.role}
                        disabled={adminUser?.id === userId}
                    >
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Select role' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='User'>User</SelectItem>
                            <SelectItem value='Admin'>Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='space-y-2'>
                    <Label>Change Tier (Manual)</Label>
                    <Select
                        onValueChange={(value: SubscriptionTier) => handleUpdateTier(value)}
                        defaultValue={details.tier}
                    >
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Select tier' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='free'>Free</SelectItem>
                            <SelectItem value='tier1'>Basic (Tier 1)</SelectItem>
                            <SelectItem value='tier2'>Plus (Tier 2)</SelectItem>
                            <SelectItem value='tier3'>Pro (Tier 3)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {details.isBanned && (
                    <AlertDialog>
                        <AlertDialogTrigger
                            render={() => (
                                <Button variant='outline' className='self-end'>
                                    Unban User
                                </Button>
                            )}
                        />
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Unban</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to unban {details.username}?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogClose
                                    render={() => (
                                        <Button size='sm' variant='ghost' className='cursor-pointer'>
                                            Cancel
                                        </Button>
                                    )}
                                />
                                <Button onClick={handleUnban}>Yes, Unban</Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    );
};
