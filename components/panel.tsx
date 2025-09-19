'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@radix-ui/react-collapsible';
import { UserDetailView } from '@/components/detailView';
import { ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Trash2, Ban } from 'lucide-react';

const API_URL = 'https://wayclip.com';

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

interface UserAdminInfo {
    id: string;
    username: string;
    email: string | null;
    tier: string;
    is_banned: boolean;
    role: 'user' | 'admin';
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
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<AdminDashboardData>(`${API_URL}/admin/dashboard`, {
                withCredentials: true,
            });
            setData(response.data);
        } catch (error) {
            toast.error(`Could not load admin data, ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRemoveVideo = async (token: string) => {
        if (!window.confirm('Are you sure you want to remove this video?')) return;
        try {
            const response = await axios.get(`${API_URL}/admin/remove/${token}`);
            toast.success(response.data);
            fetchData();
        } catch (error) {
            toast.error(`Failed to remove video, ${error}`);
        }
    };

    const handleBanUser = async (token: string) => {
        if (!window.confirm('Are you sure you want to ban this user and their IP?')) return;
        try {
            const response = await axios.get(`${API_URL}/admin/ban/${token}`);
            toast.success(response.data);
            fetchData();
        } catch (error) {
            toast.error(`Failed to ban user: ${error}`);
        }
    };

    if (isLoading) return <p>Loading Admin Data...</p>;
    if (!data) return <p>Could not load admin data.</p>;

    return (
        <div className='flex flex-col gap-8'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <ShieldAlert /> Admin Panel
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-sm text-muted-foreground'>Total Cloud Storage Used</p>
                    <p className='text-3xl font-bold'>{formatBytes(data.total_data_usage)}</p>
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
                                            <a href={`/clip/${clip.clip_id}`} target='_blank' rel='noopener noreferrer'>
                                                {clip.file_name}
                                            </a>
                                        </TableCell>
                                        <TableCell>{clip.uploader_username}</TableCell>
                                        <TableCell className='flex justify-end gap-2'>
                                            <Button
                                                size='sm'
                                                variant='destructive'
                                                onClick={() => handleRemoveVideo(clip.report_token)}
                                            >
                                                <Trash2 className='mr-2 h-4 w-4' />
                                                Remove
                                            </Button>
                                            <Button
                                                size='sm'
                                                variant='outline'
                                                onClick={() => handleBanUser(clip.report_token)}
                                            >
                                                <Ban className='mr-2 h-4 w-4' />
                                                Ban User
                                            </Button>
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
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
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
