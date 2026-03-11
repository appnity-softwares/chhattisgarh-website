'use client';

import { useEffect, useState } from 'react';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Search, RefreshCw, ChevronLeft, ChevronRight, Download, Trash2, Shield, Filter, X } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { adminService } from "@/services/admin.service";
import type { User, UserRole } from "@/types/api.types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const fetchUsers = async (page = 1) => {
        setIsLoading(true);
        setSelectedUsers(new Set()); // Clear selection on fetch
        try {
            const data = await adminService.getUsers(page, 10);
            setUsers(data.users || []);
            setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to load users',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: number, newRole: UserRole) => {
        try {
            await adminService.updateUserRole(userId.toString(), newRole);
            toast({
                title: 'Success',
                description: 'User role updated successfully',
            });
            fetchUsers(pagination.page);
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to update role',
            });
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await adminService.deleteUser(userToDelete.id.toString());
            toast({
                title: 'Success',
                description: 'User deleted successfully',
            });
            setUserToDelete(null);
            fetchUsers(pagination.page);
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to delete user',
            });
        }
    };

    // Bulk selection handlers
    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const toggleSelectUser = (userId: number) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    // Bulk delete handler
    const handleBulkDelete = async () => {
        setIsBulkProcessing(true);
        let successCount = 0;
        let errorCount = 0;

        for (const userId of selectedUsers) {
            try {
                await adminService.deleteUser(userId.toString());
                successCount++;
            } catch {
                errorCount++;
            }
        }

        setIsBulkProcessing(false);
        setBulkDeleteConfirm(false);
        setSelectedUsers(new Set());

        toast({
            title: 'Bulk Delete Complete',
            description: `Deleted ${successCount} users${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });

        fetchUsers(pagination.page);
    };

    // Bulk role change handler
    const handleBulkRoleChange = async (newRole: UserRole) => {
        setIsBulkProcessing(true);
        let successCount = 0;
        let errorCount = 0;

        for (const userId of selectedUsers) {
            try {
                await adminService.updateUserRole(userId.toString(), newRole);
                successCount++;
            } catch {
                errorCount++;
            }
        }

        setIsBulkProcessing(false);
        setSelectedUsers(new Set());

        toast({
            title: 'Bulk Role Update Complete',
            description: `Updated ${successCount} users to ${newRole}${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });

        fetchUsers(pagination.page);
    };

    // CSV Export function
    const exportToCSV = () => {
        const headers = ['ID', 'Email', 'Name', 'Role', 'Joined'];
        const rows = filteredUsers.map(user => [
            user.id,
            user.email,
            `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'N/A',
            user.role,
            new Date(user.createdAt).toLocaleDateString(),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        toast({ title: 'Success', description: `Exported ${filteredUsers.length} users to CSV` });
    };

    const filteredUsers = users.filter(user => {
        // Search filter
        const matchesSearch = searchQuery === '' ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.profile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.profile?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());

        // Role filter
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        // Status filter
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && user.isActive && !user.isBanned) ||
            (statusFilter === 'inactive' && !user.isActive) ||
            (statusFilter === 'banned' && user.isBanned);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const clearFilters = () => {
        setSearchQuery('');
        setRoleFilter('all');
        setStatusFilter('all');
    };

    const hasActiveFilters = searchQuery !== '' || roleFilter !== 'all' || statusFilter !== 'all';

    return (
        <AdminPageWrapper>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <CardTitle>User Management</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={isLoading || filteredUsers.length === 0}>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => fetchUsers(pagination.page)} disabled={isLoading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    {selectedUsers.size > 0 && (
                        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg mb-4">
                            <span className="text-sm font-medium">{selectedUsers.size} selected</span>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" disabled={isBulkProcessing}>
                                            <Shield className="mr-2 h-4 w-4" />
                                            Change Role
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleBulkRoleChange('USER' as UserRole)}>
                                            Set as User
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleBulkRoleChange('PREMIUM_USER' as UserRole)}>
                                            Set as Premium
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleBulkRoleChange('ADMIN' as UserRole)}>
                                            Set as Admin
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setBulkDeleteConfirm(true)}
                                    disabled={isBulkProcessing}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUsers(new Set())}
                            >
                                Clear Selection
                            </Button>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name or email..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="PREMIUM_USER">Premium</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="banned">Banned</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
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
                                            <Checkbox
                                                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead className="hidden sm:table-cell">Role</TableHead>
                                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                                        <TableHead className="hidden md:table-cell">Last Login</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map(user => (
                                            <TableRow key={user.id} className={selectedUsers.has(user.id) ? 'bg-muted/50' : ''}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedUsers.has(user.id)}
                                                        onCheckedChange={() => toggleSelectUser(user.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div
                                                        className="font-medium hover:underline cursor-pointer text-primary"
                                                        onClick={() => router.push(`/admin/users/${user.id}`)}
                                                    >
                                                        {user.profile
                                                            ? `${user.profile.firstName} ${user.profile.lastName}`
                                                            : 'No profile'
                                                        }
                                                    </div>
                                                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                        {user.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge variant="outline">{user.role}</Badge>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge variant={user.isBanned ? 'destructive' : user.isActive ? 'default' : 'secondary'}>
                                                        {user.isBanned ? 'BANNED' : user.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground">
                                                    {user.lastLoginAt
                                                        ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                                                        : 'Never'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'USER' as UserRole)}>
                                                                Set as User
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'PREMIUM_USER' as UserRole)}>
                                                                Set as Premium
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'ADMIN' as UserRole)}>
                                                                Set as Admin
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => setUserToDelete(user)}
                                                            >
                                                                Delete User
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
                                    Showing {users.length} of {pagination.total} users
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchUsers(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Prev
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchUsers(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {userToDelete?.email}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedUsers.size} Users?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedUsers.size} selected users? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isBulkProcessing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive text-destructive-foreground"
                            disabled={isBulkProcessing}
                        >
                            {isBulkProcessing ? 'Deleting...' : `Delete ${selectedUsers.size} Users`}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminPageWrapper>
    );
}
