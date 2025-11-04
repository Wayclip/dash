'use client';

import { useCallback, useEffect, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Ban, Trash2, Video, ExternalLink, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/authContext';
import { getPaymentInfo, ParsedPaymentInfo } from '@/lib/utils';

type UserRole = 'user' | 'admin';

interface FullUserDetails {
    id: string;
    username: string;
    email: string | null;
    avatarUrl: string | null;
    tier: string;
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

interface UserClip {
    id: string;
    file_name: string;
    file_size: number;
    created_at: string;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <p className='text-sm font-medium text-muted-foreground'>{label}</p>
        <div className='text-base'>{value || <span className='text-muted-foreground'>N/A</span>}</div>
    </div>
);

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const UserDetailView = ({ userId, onDataChange }: { userId: string; onDataChange: () => void }) => {
    const api_url = process.env.NEXT_PUBLIC_API_URL;
    const { user: adminUser } = useAuth();
    const [details, setDetails] = useState<FullUserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userClips, setUserClips] = useState<UserClip[] | null>(null);
    const [clipsLoading, setClipsLoading] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState<ParsedPaymentInfo | null>(null);

    const fetchDetails = useCallback(async () => {
        try {
            const response = await axios.get<FullUserDetails>(`${api_url}/admin/users/${userId}`, {
                withCredentials: true,
            });
            const paymentReponse = getPaymentInfo();
            setDetails(response.data);
            setPaymentInfo(paymentReponse);
        } catch (error) {
            toast.error(`Failed to fetch user details, ${error}`);
        } finally {
            setIsLoading(false);
        }
    }, [userId, api_url]);

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
            () => axios.post(`${api_url}/admin/users/${userId}/role`, { role: role }, { withCredentials: true }),
            'User role updated.',
        );
    };

    const handleUpdateTier = (tier: string) => {
        handleAction(
            () => axios.post(`${api_url}/admin/users/${userId}/tier`, { tier }, { withCredentials: true }),
            'User tier manually updated.',
        );
    };

    const handleUnban = () => {
        handleAction(
            () => axios.post(`${api_url}/admin/users/${userId}/unban`, {}, { withCredentials: true }),
            'User has been unbanned.',
        );
    };

    const handleBanUser = () => {
        handleAction(
            () => axios.post(`${api_url}/admin/users/${userId}/ban`, {}, { withCredentials: true }),
            'User has been banned.',
        );
    };

    const handleDeleteUser = () => {
        handleAction(
            () => axios.delete(`${api_url}/admin/users/${userId}`, { withCredentials: true }),
            'User has been permanently deleted.',
        );
    };

    const fetchUserClips = async () => {
        setClipsLoading(true);
        try {
            const response = await axios.get<UserClip[]>(`${api_url}/admin/users/${userId}/clips`, {
                withCredentials: true,
            });
            setUserClips(response.data);
        } catch (error) {
            toast.error(`Failed to fetch user clips, ${error}`);
        } finally {
            setClipsLoading(false);
        }
    };

    const handleDeleteClip = async (clipId: string) => {
        try {
            await axios.delete(`${api_url}/admin/clips/${clipId}`, { withCredentials: true });
            toast.success('Clip deleted successfully.');
            await fetchUserClips();
        } catch (error) {
            toast.error(`Failed to delete clip, ${error}`);
        }
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
                <DetailItem label='Email' value={<pre className='text-xs'>{details.email}</pre>} />
                <DetailItem
                    label='Joined At'
                    value={<pre className='text-xs'>{new Date(details.createdAt).toLocaleString()}</pre>}
                />
                <DetailItem
                    label='Email Verified'
                    value={
                        details.emailVerifiedAt ? (
                            <pre className='text-xs'>{new Date(details.emailVerifiedAt).toLocaleString()}</pre>
                        ) : (
                            <pre className='text-xs'>
                                <Badge variant='secondary'>No</Badge>
                            </pre>
                        )
                    }
                />
                <DetailItem
                    label='2FA Enabled'
                    value={
                        details.twoFactorEnabled ? (
                            <pre className='text-xs'>
                                <Badge>Yes</Badge>
                            </pre>
                        ) : (
                            <pre className='text-xs'>
                                <Badge variant='outline'>No</Badge>
                            </pre>
                        )
                    }
                />
                <DetailItem
                    label='Subscription Status'
                    value={
                        details.subscriptionStatus ? (
                            <pre className='text-xs'>
                                <Badge>{details.subscriptionStatus}</Badge>
                            </pre>
                        ) : null
                    }
                />
                <DetailItem
                    label='Period End'
                    value={
                        details.currentPeriodEnd ? (
                            <pre className='text-xs'>{new Date(details.currentPeriodEnd).toLocaleDateString()}</pre>
                        ) : null
                    }
                />
                <DetailItem
                    label='Auth Methods'
                    value={
                        <div className='flex gap-1 flex-wrap text-xs'>
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
                            <SelectItem value='user'>User</SelectItem>
                            <SelectItem value='admin'>Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='space-y-2'>
                    <Label>Change Tier (Manual)</Label>
                    <Select onValueChange={(value: string) => handleUpdateTier(value)} defaultValue={details.tier}>
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Select tier' />
                        </SelectTrigger>
                        <SelectContent>
                            {paymentInfo?.active_tiers.map((v, i) => (
                                <SelectItem value={v.name.toLowerCase()} key={i}>
                                    {v.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button variant='outline' className='self-end' onClick={fetchUserClips}>
                    <Video className='mr-2 h-4 w-4' />
                    {userClips ? 'Refresh Clips' : 'View User Clips'}
                </Button>

                {details.isBanned ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant='outline' className='self-end'>
                                Unban User
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Unban</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to unban {details.username}?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleUnban}>Yes, Unban</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant='outline' className='self-end' disabled={adminUser?.id === userId}>
                                <Ban className='mr-2 h-4 w-4' /> Ban User
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Ban</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to ban {details.username}? Their account will be suspended.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleBanUser}>Yes, Ban User</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant='destructive' className='self-end' disabled={adminUser?.id === userId}>
                            <Trash2 className='mr-2 h-4 w-4' /> Delete User
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Permanent Deletion</AlertDialogTitle>
                            <AlertDialogDescription>
                                This is irreversible. All of {details.username}&apos;s data, including clips and account
                                info, will be permanently deleted.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteUser}
                                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            >
                                Yes, Delete User
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {clipsLoading && (
                <div className='flex justify-center items-center p-6'>
                    <Loader2 className='animate-spin' />
                </div>
            )}
            {userClips && (
                <div className='pt-4 border-t'>
                    <h3 className='text-lg font-semibold mb-2'>
                        Clips by {details.username} ({userClips.length})
                    </h3>
                    {userClips.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File Name</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Uploaded</TableHead>
                                    <TableHead className='text-right'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userClips.map((clip) => (
                                    <TableRow key={clip.id}>
                                        <TableCell className='font-medium truncate max-w-xs'>
                                            <a
                                                href={`${api_url}/clip/${clip.id}`}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='hover:underline flex items-center gap-2'
                                            >
                                                {clip.file_name}
                                                <ExternalLink className='size-4 text-muted-foreground flex-shrink-0' />
                                            </a>
                                        </TableCell>
                                        <TableCell>{formatBytes(clip.file_size)}</TableCell>
                                        <TableCell>{new Date(clip.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className='flex justify-end gap-2'>
                                            <Button
                                                size='icon'
                                                variant='outline'
                                                onClick={() =>
                                                    navigator.clipboard.writeText(`${api_url}/clip/${clip.id}`)
                                                }
                                            >
                                                <Copy className='h-4 w-4' />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size='icon' variant='destructive'>
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Clip?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the clip &quot;{clip.file_name}
                                                            &quot;. This action is irreversible.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteClip(clip.id)}>
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className='text-muted-foreground'>This user has no clips.</p>
                    )}
                </div>
            )}
        </div>
    );
};
