'use client';

import { useEffect, useState } from 'react';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { adminService } from "@/services/admin.service";
import type { Profile } from "@/types/api.types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { displayValue, formatProfileName } from "@/lib/display-format";

export default function AdminProfilesPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProfiles, setSelectedProfiles] = useState<Set<number>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const fetchProfiles = async (page = 1) => {
        setIsLoading(true);
        try {
            const data = await adminService.getProfiles(page, 10);
            setProfiles(data.profiles || []);
            const pag = (data as any).pagination;
            setPagination({
                page: Number(pag?.page) || 1,
                limit: Number(pag?.limit) || 10,
                total: Number(pag?.total) || 0,
                totalPages: Number(pag?.totalPages) || 0
            });
        } catch (err: unknown) {
            console.error('Failed to fetch profiles:', err);
            const errorMsg = err as { message?: string };
            toast({
                variant: 'destructive',
                title: 'Error',
                description: errorMsg.message || 'Failed to load profiles',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredProfiles = profiles.filter(profile =>
        profile.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.profileId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedProfiles.size === filteredProfiles.length && filteredProfiles.length > 0) {
            setSelectedProfiles(new Set());
        } else {
            setSelectedProfiles(new Set(filteredProfiles.map(p => p.id)));
        }
    };

    const toggleSelectProfile = (id: number) => {
        const next = new Set(selectedProfiles);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedProfiles(next);
    };

    const handleBulkApprove = async () => {
        setIsBulkProcessing(true);
        try {
            await adminService.bulkModeration(Array.from(selectedProfiles), 'profiles', 'approve');
            toast({ title: 'Bulk Approve Complete', description: `Approved ${selectedProfiles.size} profiles` });
            fetchProfiles(pagination.page);
        } catch (err: unknown) {
            const errorMsg = err as { message?: string };
            toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to approve profiles' });
        } finally {
            setIsBulkProcessing(false);
            setSelectedProfiles(new Set());
        }
    };

    const handleBulkDelete = async () => {
        setIsBulkProcessing(true);
        try {
            await adminService.bulkModeration(Array.from(selectedProfiles), 'profiles', 'delete');
            toast({ title: 'Bulk Delete Complete', description: `Deleted ${selectedProfiles.size} profiles` });
            fetchProfiles(pagination.page);
        } catch (err: unknown) {
            const errorMsg = err as { message?: string };
            toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to delete profiles' });
        } finally {
            setIsBulkProcessing(false);
            setSelectedProfiles(new Set());
        }
    };

    return (
        <AdminPageWrapper>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <CardTitle>Profile Reviews</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => fetchProfiles(pagination.page)} disabled={isLoading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by profile ID or name..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {selectedProfiles.size > 0 && (
                        <div className="flex items-center gap-3 mt-4 p-3 rounded-lg bg-muted border">
                            <span className="text-sm font-semibold">{selectedProfiles.size} selected</span>
                            <div className="flex gap-2 ml-auto">
                                <Button size="sm" onClick={handleBulkApprove} disabled={isBulkProcessing} className="bg-emerald-500 hover:bg-emerald-600">
                                    Approve Selected
                                </Button>
                                <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={isBulkProcessing}>
                                    Delete Selected
                                </Button>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300"
                                                checked={selectedProfiles.size === filteredProfiles.length && filteredProfiles.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Profile</TableHead>
                                        <TableHead>Completeness</TableHead>
                                        <TableHead>Verification Status</TableHead>
                                        <TableHead className="hidden md:table-cell">Location</TableHead>
                                        <TableHead className="hidden lg:table-cell">Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProfiles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                No profiles found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProfiles.map(profile => (
                                            <TableRow key={profile.id} className={selectedProfiles.has(profile.id) ? "bg-muted/50" : ""}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300"
                                                        checked={selectedProfiles.has(profile.id)}
                                                        onChange={() => toggleSelectProfile(profile.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {formatProfileName(profile)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground break-all">
                                                        {displayValue(profile.profileId)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${profile.profileCompleteness}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm">{profile.profileCompleteness}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        profile.isVerified ? 'default' :
                                                            profile.isPublished ? 'secondary' :
                                                                'outline'
                                                    }>
                                                        {profile.isVerified ? 'VERIFIED' :
                                                            profile.isPublished ? 'PENDING' :
                                                                'DRAFT'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground">
                                                    {[profile.city, profile.state].map(value => displayValue(value, '')).filter(Boolean).join(', ') || '-'}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell text-muted-foreground">
                                                    {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Review Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => router.push(`/admin/users/${profile.userId}`)} className="cursor-pointer">
                                                                View User Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => router.push(`/admin/profiles/${profile.userId}/edit`)} className="cursor-pointer text-primary">
                                                                Edit Profile Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={async () => {
                                                                    try {
                                                                        await adminService.verifyProfile(profile.id, true);
                                                                        toast({ title: 'Profile Verified', description: `${formatProfileName(profile)} profile is now verified.` });
                                                                        fetchProfiles(pagination.page);
                                                                    } catch (err: unknown) {
                                                                        const errorMsg = err as { message?: string };
                                                                        toast({ variant: 'destructive', title: 'Error', description: errorMsg.message });
                                                                    }
                                                                }}
                                                                className="cursor-pointer text-emerald-400 focus:text-emerald-400"
                                                            >
                                                                Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={async () => {
                                                                    try {
                                                                        await adminService.updateProfileStatus(profile.id, false, 'Incomplete data');
                                                                        toast({ title: 'Status Updated', description: 'User requested for resubmission.' });
                                                                        fetchProfiles(pagination.page);
                                                                    } catch (err: unknown) {
                                                                        const errorMsg = err as { message?: string };
                                                                        toast({ variant: 'destructive', title: 'Error', description: errorMsg.message });
                                                                    }
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                Request Resubmission
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={async () => {
                                                                    if (!confirm('Reject this profile?')) return;
                                                                    try {
                                                                        await adminService.updateProfileStatus(profile.id, false, 'Rejected by admin');
                                                                        toast({ title: 'Profile Rejected', description: 'Profile has been unpublished.' });
                                                                        fetchProfiles(pagination.page);
                                                                    } catch (err: unknown) {
                                                                        const errorMsg = err as { message?: string };
                                                                        toast({ variant: 'destructive', title: 'Error', description: errorMsg.message });
                                                                    }
                                                                }}
                                                                className="text-destructive cursor-pointer"
                                                            >
                                                                Reject
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {profiles.length} of {pagination.total} profiles
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchProfiles(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Prev
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchProfiles(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages}
                                    >
                                        Next <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </AdminPageWrapper>
    );
}
