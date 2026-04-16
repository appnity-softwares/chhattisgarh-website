'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreHorizontal, Search, RefreshCw, ChevronLeft, ChevronRight,
  Download, Trash2, Shield, Filter, X, Users, Ban, CheckCircle,
  Eye, AlertTriangle, UserCheck, Upload, FileText, Calendar, CreditCard, Star, Pencil
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { adminService } from "@/services/admin.service";
import type { User, UserRole } from "@/types/api.types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

function StatusBadge({ user }: { user: User }) {
  if (user.isBanned) return <span className="badge-banned text-[10px] font-semibold px-2 py-0.5 rounded-full">Banned</span>;
  if (user.isActive) return <span className="badge-active text-[10px] font-semibold px-2 py-0.5 rounded-full">Active</span>;
  return <span className="badge-inactive text-[10px] font-semibold px-2 py-0.5 rounded-full">Inactive</span>;
}

function RoleBadge({ role }: { role: string }) {
  const variants: Record<string, string> = {
    ADMIN: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    PREMIUM_USER: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    USER: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${variants[role] || variants.USER}`}>
      {role === 'PREMIUM_USER' ? 'Premium' : role}
    </span>
  );
}

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

  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isGrantSubOpen, setIsGrantSubOpen] = useState(false);
  const [selectedUserForSub, setSelectedUserForSub] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [subData, setSubData] = useState({ planId: 2, customDays: 90 });

  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    const search = !q || user.email?.toLowerCase().includes(q) ||
      user.profile?.firstName?.toLowerCase().includes(q) ||
      user.profile?.lastName?.toLowerCase().includes(q);
    const role = roleFilter === 'all' || user.role === roleFilter;
    const status = statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive && !user.isBanned) ||
      (statusFilter === 'inactive' && !user.isActive) ||
      (statusFilter === 'banned' && user.isBanned);
    return search && role && status;
  });

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    setSelectedUsers(new Set());
    try {
      const data = await adminService.getUsers(page, 10);
      setUsers(data.users || []);
      const pag = data.pagination as any;
      setPagination({
        page: (pag?.page as number) || 1,
        limit: (pag?.limit as number) || 10,
        total: (pag?.total as number) || 0,
        totalPages: (pag?.totalPages as number) || 0
      });
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to load users' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      if (newRole === 'PREMIUM_USER') {
        setSelectedUserForSub(users.find(u => u.id === userId) || null);
        setIsGrantSubOpen(true);
      } else {
        await adminService.updateUserRole(userId.toString(), newRole);
        toast({ title: 'Role Updated', description: 'User role changed successfully' });
        fetchUsers(pagination.page);
      }
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to update role' });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await adminService.deleteUser(userToDelete.id.toString());
      toast({ title: 'User Deleted', description: 'User has been permanently removed' });
      setUserToDelete(null);
      window.location.reload();
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to delete user' });
    }
  };

  const handleBanUser = async (user: User) => {
    const reason = prompt(`Ban reason for ${user.email || 'this user'}:`, 'Violation of community guidelines');
    if (reason === null) return;
    try {
      await adminService.banUser(user.id.toString(), reason);
      toast({ title: 'User Banned', description: 'Account has been restricted' });
      window.location.reload();
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to ban user' });
    }
  };

  const handleUnbanUser = async (user: User) => {
    if (!confirm(`Unban ${user.email}?`)) return;
    try {
      await adminService.unbanUser(user.id.toString());
      toast({ title: 'User Unbanned', description: 'Account access has been restored' });
      window.location.reload();
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to unban user' });
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const toggleSelectUser = (userId: number) => {
    const next = new Set(selectedUsers);
    if (next.has(userId)) {
        next.delete(userId);
    } else {
        next.add(userId);
    }
    setSelectedUsers(next);
  };

  const handleBulkDelete = async () => {
    setIsBulkProcessing(true);
    try {
      await adminService.bulkModeration(Array.from(selectedUsers), 'users', 'delete');
      toast({ title: 'Bulk Delete Complete', description: `Successfully deleted ${selectedUsers.size} users` });
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to delete users' });
    } finally {
      setIsBulkProcessing(false);
      setBulkDeleteConfirm(false);
      setSelectedUsers(new Set());
      window.location.reload();
    }
  };

  const handleBulkBan = async () => {
    setIsBulkProcessing(true);
    try {
      await adminService.bulkModeration(Array.from(selectedUsers), 'users', 'ban');
      toast({ title: 'Bulk Ban Complete', description: `Successfully banned ${selectedUsers.size} users` });
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to ban users' });
    } finally {
      setIsBulkProcessing(false);
      setSelectedUsers(new Set());
      window.location.reload();
    }
  };

  const handleBulkRoleChange = async (newRole: UserRole) => {
    setIsBulkProcessing(true);
    let successCount = 0;
    for (const id of selectedUsers) {
      try { await adminService.updateUserRole(id.toString(), newRole); successCount++; }
      catch { /* handle error */ }
    }
    setIsBulkProcessing(false);
    setSelectedUsers(new Set());
    toast({ title: 'Bulk Update Complete', description: `${successCount} updated to ${newRole}` });
    window.location.reload();
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const res = await adminService.bulkUploadUsers(selectedFile);
      toast({ 
        title: 'Upload Sequential', 
        description: `Successfully uploaded ${res.success} users. ${res.failed} failed.` 
      });
      setIsBulkUploadOpen(false);
      setSelectedFile(null);
      fetchUsers();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGrantSubscription = async () => {
    if (!selectedUserForSub) return;
    try {
      await adminService.grantSubscription(selectedUserForSub.id.toString(), subData.planId, subData.customDays);
      toast({ title: 'Subscription Granted', description: `Granted successfully for ${selectedUserForSub.email}` });
      setIsGrantSubOpen(false);
      fetchUsers(pagination.page);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Grant Failed', description: err.message });
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Email', 'Name', 'Role', 'Status', 'Joined'];
    const rows = filteredUsers.map(u => [
      u.id, u.email,
      `${u.profile?.firstName || ''} ${u.profile?.lastName || ''}`.trim() || 'N/A',
      u.role, u.isBanned ? 'Banned' : u.isActive ? 'Active' : 'Inactive',
      new Date(u.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Export Successful', description: `${filteredUsers.length} users exported` });
  };

  const hasFilters = searchQuery !== '' || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="space-y-5 notranslate">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? 'Loading...' : `${(pagination.total || 0).toLocaleString()} total users`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsBulkUploadOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bulk Upload</span>
          </button>
          <button
            onClick={exportToCSV}
            disabled={isLoading || filteredUsers.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white text-sm font-medium transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
            <button
            onClick={() => fetchUsers(pagination.page)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white text-sm font-medium transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="admin-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/[0.06] space-y-3">
          {/* Bulk Actions Bar */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <UserCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-purple-300">{selectedUsers.size} selected</span>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex gap-2 flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button disabled={isBulkProcessing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors disabled:opacity-50">
                      <Shield className="w-3 h-3" /> Change Role
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-card border-border">
                    <DropdownMenuItem onClick={() => handleBulkRoleChange('USER' as UserRole)}>Set as User</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkRoleChange('PREMIUM_USER' as UserRole)}>Set as Premium</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkRoleChange('ADMIN' as UserRole)}>Set as Admin</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/[0.06]" />
                    <DropdownMenuItem onClick={handleBulkBan} className="text-amber-400 focus:text-amber-400 focus:bg-amber-500/10">Ban Selected</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  disabled={isBulkProcessing}
                  onClick={() => setBulkDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" /> Delete Selected
                </button>
              </div>
              <button onClick={() => setSelectedUsers(new Set())} className="ml-auto text-muted-foreground hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[120px] bg-white/[0.05] border-white/[0.08] text-white rounded-xl">
                  <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="PREMIUM_USER">Premium</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] bg-white/[0.05] border-white/[0.08] text-white rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <button onClick={() => { setSearchQuery(''); setRoleFilter('all'); setStatusFilter('all'); }} className="p-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-muted-foreground hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th className="w-10 px-4 py-3.5 text-left">
                  <Checkbox
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-white/20"
                  />
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Last Login</th>
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="px-4 py-3"><div className="w-4 h-4 skeleton-pulse rounded" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 skeleton-pulse rounded-full" />
                        <div className="space-y-1.5">
                          <div className="w-28 h-3.5 skeleton-pulse rounded" />
                          <div className="w-36 h-3 skeleton-pulse rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="w-14 h-5 skeleton-pulse rounded-full" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="w-14 h-5 skeleton-pulse rounded-full" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="w-20 h-3.5 skeleton-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="w-8 h-8 skeleton-pulse rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No users found</p>
                    {hasFilters && <button onClick={() => { setSearchQuery(''); setRoleFilter('all'); setStatusFilter('all'); }} className="text-purple-400 text-xs mt-2 hover:underline">Clear filters</button>}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className={`border-b border-white/[0.04] transition-colors ${selectedUsers.has(user.id) ? 'bg-purple-500/5' : ''}`}>
                    <td className="px-4 py-3.5">
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                        className="border-white/20"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/40 to-indigo-600/40 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-purple-300">
                            {user.profile ? user.profile.firstName?.charAt(0)?.toUpperCase() : user.email?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            className="text-sm font-medium text-white hover:text-purple-300 transition-colors text-left"
                          >
                            {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'No profile'}
                          </button>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-3.5 hidden sm:table-cell"><StatusBadge user={user} /></td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-xs text-muted-foreground">
                      {user.lastLoginAt ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true }) : 'Never'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border w-48">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/[0.06]" />
                          <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)} className="gap-2 cursor-pointer">
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/profiles/${user.id}/edit`)} className="gap-2 cursor-pointer text-primary">
                            <Pencil className="w-3.5 h-3.5" /> Manage Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/[0.06]" />
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Change Role</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'USER' as UserRole)} className="text-xs cursor-pointer">Set as User</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'PREMIUM_USER' as UserRole)} className="text-xs cursor-pointer">Set as Premium</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/[0.06]" />
                          {user.isBanned ? (
                            <DropdownMenuItem onClick={() => handleUnbanUser(user)} className="text-emerald-400 focus:text-emerald-400 focus:bg-emerald-500/10 gap-2 cursor-pointer">
                              <CheckCircle className="w-3.5 h-3.5" /> Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleBanUser(user)} className="text-amber-400 focus:text-amber-400 focus:bg-amber-500/10 gap-2 cursor-pointer">
                              <Ban className="w-3.5 h-3.5" /> Ban User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setUserToDelete(user)} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 gap-2 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3.5 border-t border-white/[0.06]">
          <p className="text-xs text-muted-foreground">
            {isLoading ? '...' : `Showing ${users.length} of ${pagination.total || 0} users`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong className="text-white">{userToDelete?.email}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/10 text-white hover:bg-white/15">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700 text-white">Delete User</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Delete {selectedUsers.size} Users?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {selectedUsers.size} selected users. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkProcessing} className="bg-white/10 border-white/10 text-white hover:bg-white/15">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isBulkProcessing} className="bg-red-600 hover:bg-red-700 text-white">
              {isBulkProcessing ? 'Deleting...' : `Delete ${selectedUsers.size} Users`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Bulk Upload Modal */}
      <AlertDialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <AlertDialogContent className="bg-card border-border max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <Upload className="w-5 h-5 text-purple-400" /> Bulk User Upload
            </AlertDialogTitle>
            <AlertDialogDescription>
              Upload an Excel (.xlsx) or CSV file containing user data. 
              The file should include email, phone, firstName, and lastName.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer relative">
              <input 
                type="file" 
                accept=".xlsx,.csv" 
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="bg-white/5 p-3 rounded-full">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-xs font-medium text-white">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop'}
              </p>
              <p className="text-[10px] text-muted-foreground">Max file size: 5MB</p>
            </div>
            <a href="/templates/bulk-user-template.xlsx" className="text-[10px] text-purple-400 hover:underline flex items-center justify-center gap-1">
              <Download className="w-3 h-3" /> Download Template
            </a>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/10 text-white hover:bg-white/15">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleBulkUpload(); }} 
              disabled={!selectedFile || isUploading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isUploading ? 'Uploading...' : 'Start Upload'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Grant Subscription Modal */}
      <AlertDialog open={isGrantSubOpen} onOpenChange={setIsGrantSubOpen}>
        <AlertDialogContent className="bg-card border-border max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <Star className="w-5 h-5 text-amber-400" /> Grant Premium Subscription
            </AlertDialogTitle>
            <AlertDialogDescription>
              Manually activate premium benefits for <strong className="text-white">{selectedUserForSub?.email}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-6 space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Select Plan</label>
              <Select value={subData.planId.toString()} onValueChange={(v) => setSubData({ ...subData, planId: parseInt(v) })}>
                <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl">
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="1">Basic Plan</SelectItem>
                  <SelectItem value="2">Gold Plan</SelectItem>
                  <SelectItem value="3">Diamond Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Duration (Days)</label>
              <div className="flex gap-2">
                {[30, 90, 180, 365].map(days => (
                  <button 
                    key={days}
                    onClick={() => setSubData({ ...subData, customDays: days })}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${subData.customDays === days ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white'}`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/10 text-white hover:bg-white/15">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleGrantSubscription(); }} 
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Confirm Membership
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
