'use client';

import { useState, useEffect, useCallback } from 'react';
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
import axios from 'axios';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@radix-ui/react-collapsible';
import { UserDetailView } from '@/components/detailView';
import { ChevronsUpDown, Trash2, Ban, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConfig } from '@/contexts/configContext';
import { formatBytes } from '@/lib/utils';

interface UserAdminInfo {
    id: string;
    username: string;
    email: string | null;
    tier: string;
    is_banned: boolean;
    role: 'User' | 'Admin';
    clip_count: number;
    data_used: number;
}
interface ReportedClipInfo {
    clip_id: string;
    file_name: string;
    uploader_username: string;
    report_token: string;
}
interface AdminDashboardData {
    users: UserAdminInfo[];
    reported_clips: ReportedClipInfo[];
    total_data_usage: number;
}

const AdminPanel = () => {
    const { config } = useConfig();
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!config?.apiUrl) return;
        setIsLoading(true);
        try {
            const response = await axios.get<AdminDashboardData>(`${config.apiUrl}/admin/dashboard`, {
                withCredentials: true,
            });
            setData(response.data);
        } catch (error) {
            console.error(error);
            toast.error(`Could not load admin data.`);
        } finally {
            setIsLoading(false);
        }
    }, [config?.apiUrl]);

    useEffect(() => {
        if (config) {
            fetchData();
        }
    }, [config, fetchData]);

    const handleAction = async (endpoint: string, successMessage: string, errorMessage: string) => {
        if (!config?.apiUrl) return;
        try {
            const response = await axios.get(`${config.apiUrl}/admin/${endpoint}`, { withCredentials: true });
            toast.success(response.data.message || successMessage);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(errorMessage);
        }
    };

    const handleRemoveVideo = (token: string) =>
        handleAction(`remove/${token}`, 'Video removed.', 'Failed to remove video.');
    const handleBanUser = (token: string) => handleAction(`ban/${token}`, 'User banned.', 'Failed to ban user.');
    const handleIgnoreReport = (token: string) =>
        handleAction(`ignore/${token}`, 'Report ignored.', 'Failed to ignore report.');

    if (isLoading) return <p>Loading Admin Data...</p>;
    if (!data || !config) return <p>Could not load admin data.</p>;

    return (
        <div className='flex flex-col gap-4'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>Dashboard Data</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-row gap-20'>
                    <div className='flex flex-col gap-1'>
                        <p className='text-sm text-muted-foreground'>Total Storage Used</p>
                        <p className='text-3xl font-bold'>{formatBytes(data.total_data_usage)}</p>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <p className='text-sm text-muted-foreground'>Total Users</p>
                        <p className='text-3xl font-bold'>{data.users.length}</p>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <p className='text-sm text-muted-foreground'>Active Reports</p>
                        <p className='text-3xl font-bold'>{data.reported_clips.length}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Reported Clips</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.reported_clips.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Clip</TableHead>
                                    <TableHead>Uploader</TableHead>
                                    <TableHead className='text-right'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.reported_clips.map((clip) => (
                                    <TableRow key={clip.clip_id}>
                                        <TableCell>
                                            <a
                                                href={`${config.apiUrl}/clip/${clip.clip_id}`}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                            >
                                                {clip.file_name}
                                            </a>
                                        </TableCell>
                                        <TableCell>{clip.uploader_username}</TableCell>
                                        <TableCell className='flex justify-end gap-2'>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size='sm' variant='ghost' className='cursor-pointer'>
                                                        <EyeOff className='mr-2 h-4 w-4' />
                                                        Ignore
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Ignore Report?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to ignore this report? This action is
                                                            irreversible.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleIgnoreReport(clip.report_token)}
                                                        >
                                                            Ignore
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
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
                                                        <AlertDialogAction
                                                            onClick={() => handleRemoveVideo(clip.report_token)}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size='sm' className='cursor-pointer' variant='outline'>
                                                        <Ban className='mr-2 h-4 w-4' />
                                                        Ban User
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Ban User?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            You are going to ban user &quot;{clip.uploader_username}
                                                            &quot;. This action is reversible*.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleBanUser(clip.report_token)}
                                                        >
                                                            Ban User
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
                        <p>No active reports.</p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Subscription</TableHead>
                                <TableHead>Clips</TableHead>
                                <TableHead>Data Used</TableHead>
                                <TableHead className='w-[50px]'></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.users.map((user) => (
                                <Collapsible
                                    asChild
                                    key={user.id}
                                    open={openCollapsible === user.id}
                                    onOpenChange={() =>
                                        setOpenCollapsible((prev) => (prev === user.id ? null : user.id))
                                    }
                                >
                                    <>
                                        <CollapsibleTrigger asChild>
                                            <TableRow className='cursor-pointer hover:bg-muted/50 data-[state=open]:bg-muted'>
                                                <TableCell>{user.username}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.is_banned ? (
                                                        <Badge variant='destructive'>Banned</Badge>
                                                    ) : (
                                                        <Badge variant='outline'>Active</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{user.tier}</TableCell>
                                                <TableCell>{user.clip_count}</TableCell>
                                                <TableCell>{formatBytes(user.data_used)}</TableCell>
                                                <TableCell>
                                                    <ChevronsUpDown className='h-4 w-4 text-muted-foreground' />
                                                </TableCell>
                                            </TableRow>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent asChild>
                                            <tr>
                                                <td colSpan={7}>
                                                    {openCollapsible === user.id && (
                                                        <UserDetailView userId={user.id} onDataChange={fetchData} />
                                                    )}
                                                </td>
                                            </tr>
                                        </CollapsibleContent>
                                    </>
                                </Collapsible>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
export default AdminPanel;
