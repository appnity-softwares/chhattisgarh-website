'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Search, RefreshCw, ChevronLeft, ChevronRight, Download, Trash2, Shield, Filter, X, Users, Ban, CheckCircle, Eye, AlertTriangle, UserCheck, Upload, FileText, UserPlus, Star, Pencil } from "lucide-react";
import { HEIGHT_OPTIONS } from "@/utils/height-utils";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { adminService } from "@/services/admin.service";
import type { User, UserRole, PaginationData } from "@/types/api.types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from 'next/navigation';
import { formatProfileName } from "@/lib/display-format";
function StatusBadge({ user }: { user: User }) {
  if (user.isBanned) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="badge-banned text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-help">
              Banned
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-red-950 border-red-500/30 text-red-200">
            <p className="max-w-xs break-words">
              <span className="font-bold">Ban Reason:</span> {user.banReason || 'No reason provided'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
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

function MatchStatusBadge({ user }: { user: User }) {
  const profile = user.profile;
  if (!profile) {
    return (
      <span className="bg-slate-500/15 text-slate-400 border border-slate-500/25 text-[10px] font-semibold px-2 py-0.5 rounded-full">
        No Profile
      </span>
    );
  }

  const isMatchReady =
    user.isActive &&
    !user.isBanned &&
    profile.isPublished;

  if (isMatchReady) {
    return (
      <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-semibold px-2 py-0.5 rounded-full">
        Listed
      </span>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-help">
            Not Listed
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-amber-950 border-amber-500/30 text-amber-200">
          <div className="text-[11px] py-1">
            <p className="font-bold mb-1 border-b border-white/10 pb-1">Listing Requirements:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-1.5">
                {user.isActive && !user.isBanned ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-rose-400" />}
                <span>Active Account</span>
              </li>
              <li className="flex items-center gap-1.5">
                {profile.isPublished ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-rose-400" />}
                <span>Profile Published</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>Completion not required for browsing ({profile.profileCompleteness || 0}%)</span>
              </li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<{ page: number, limit: number, total: number, totalPages: number }>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToPermanentlyDelete, setUserToPermanentlyDelete] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('Violation of community guidelines');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkPermanentDeleteConfirm, setBulkPermanentDeleteConfirm] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [matchFilter, setMatchFilter] = useState<string>('all');

  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isGrantSubOpen, setIsGrantSubOpen] = useState(false);
  const [selectedUserForSub, setSelectedUserForSub] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [subData, setSubData] = useState({ planId: 2, customDays: 90 });

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    phone: '',
    countryCode: '+91',
    email: '',
    role: 'USER',
    firstName: '',
    lastName: '',
    gender: 'MALE',
    dateOfBirth: '',
    maritalStatus: 'NEVER_MARRIED',
    religion: 'HINDU',
    motherTongue: 'CHHATTISGARHI',
    category: '',
    caste: '',
    subCaste: '',
    nativeVillage: '',
    city: '',
    state: 'Chhattisgarh',
    speaksChhattisgarhi: true,
    // New Fields
    height: '',
    highestEducation: '',
    occupation: '',
    annualIncome: '',
    fatherOccupation: '',
    familyIncome: '',
    bio: '',
  });

  const handleCreateUser = async () => {
    // Keep this to fields required by the current database schema/admin login flow.
    const requiredFields = {
      phone: newUserData.phone,
      firstName: newUserData.firstName,
      gender: newUserData.gender,
      dateOfBirth: newUserData.dateOfBirth,
      city: newUserData.city
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Missing Required Fields',
        description: `Please provide: ${missingFields.join(', ')}`
      });
      return;
    }
    setIsCreatingUser(true);
    try {
      await adminService.createUserWithProfile(newUserData);
      toast({ title: 'User Created', description: `Successfully created user and profile for ${newUserData.firstName}` });
      setIsCreateUserOpen(false);
      setNewUserData({
        phone: '',
        countryCode: '+91',
        email: '',
        role: 'USER',
        firstName: '',
        lastName: '',
        gender: 'MALE',
        dateOfBirth: '',
        maritalStatus: 'NEVER_MARRIED',
        religion: 'HINDU',
        motherTongue: 'CHHATTISGARHI',
        category: '',
        caste: '',
        subCaste: '',
        nativeVillage: '',
        city: '',
        state: 'Chhattisgarh',
        speaksChhattisgarhi: true,
        height: '',
        highestEducation: '',
        occupation: '',
        annualIncome: '',
        fatherOccupation: '',
        familyIncome: '',
        bio: '',
      });
      fetchUsers(1);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Creation failed';
      toast({ variant: 'destructive', title: 'Creation Failed', description: errorMsg });
    } finally {
      setIsCreatingUser(false);
    }
  };

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
    const match = matchFilter === 'all' || (() => {
      const isMatchReady = user.profile && user.isActive && !user.isBanned && user.profile.isPublished;
      return (matchFilter === 'listed' && isMatchReady) || (matchFilter === 'not_listed' && !isMatchReady);
    })();
    return search && role && status && match;
  });

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    setSelectedUsers(new Set());
    try {
      const data = await adminService.getUsers(page, 10);
      setUsers(data.users || []);
      const pag = data.pagination as unknown as PaginationData;
      setPagination({
        page: pag?.page || 1,
        limit: pag?.limit || 10,
        total: pag?.total || 0,
        totalPages: pag?.totalPages || 0
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load users';
      toast({ variant: 'destructive', title: 'Error', description: errorMsg });
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
      await adminService.banUser(userToDelete.id.toString(), banReason);
      toast({ title: 'User Restricted', description: 'User has been banned instead of deleted to preserve records' });
      setUserToDelete(null);
      setBanReason('Violation of community guidelines');
      fetchUsers(pagination.page);
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to restrict user' });
    }
  };

  const handlePermanentDeleteUser = async () => {
    if (!userToPermanentlyDelete) return;

    try {
      await adminService.deleteUserAccount(userToPermanentlyDelete.id.toString());
      toast({ title: 'User Permanently Removed', description: 'All associated data has been deleted.' });
      setUserToPermanentlyDelete(null);
      fetchUsers(pagination.page);
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to permanently delete user' });
    }
  };

  const handleBanUser = async (user: User) => {
    try {
      await adminService.banUser(user.id.toString(), 'Violation of community guidelines');
      toast({ title: 'User Banned', description: 'Account has been restricted' });
      fetchUsers(pagination.page);
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to ban user' });
    }
  };

  const handleUnbanUser = async (user: User) => {
    try {
      await adminService.unbanUser(user.id.toString());
      toast({ title: 'User Unbanned', description: 'Account access has been restored' });
      fetchUsers(pagination.page);
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
      await adminService.bulkBanUsers(Array.from(selectedUsers).map(id => id.toString()), banReason || 'Bulk soft-delete by admin');
      toast({ title: 'Bulk restriction Complete', description: `Successfully banned ${selectedUsers.size} users` });
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to restrict users' });
    } finally {
      setIsBulkProcessing(false);
      setBulkDeleteConfirm(false);
      setBanReason('Violation of community guidelines');
      setSelectedUsers(new Set());
      fetchUsers(pagination.page);
    }
  };

  const handleBulkUnban = async () => {
    setIsBulkProcessing(true);
    try {
      await adminService.bulkUnbanUsers(Array.from(selectedUsers).map(id => id.toString()));
      toast({ title: 'Bulk Unban Complete', description: `Successfully unbanned ${selectedUsers.size} users` });
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to unban users' });
    } finally {
      setIsBulkProcessing(false);
      setSelectedUsers(new Set());
      fetchUsers(pagination.page);
    }
  };

  const handleBulkPermanentDelete = async () => {
    setIsBulkProcessing(true);
    try {
      await adminService.bulkDeleteUsers(Array.from(selectedUsers).map(id => id.toString()));
      toast({ title: 'Bulk Permanent Deletion Complete', description: `Successfully removed ${selectedUsers.size} users and all their data.` });
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to permanently delete users' });
    } finally {
      setIsBulkProcessing(false);
      setBulkPermanentDeleteConfirm(false);
      setSelectedUsers(new Set());
      fetchUsers(pagination.page);
    }
  };

  const _handleBulkBan = async () => {
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
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      toast({ variant: 'destructive', title: 'Upload Failed', description: errorMsg });
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
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Grant failed';
      toast({ variant: 'destructive', title: 'Grant Failed', description: errorMsg });
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Email', 'Name', 'Role', 'Status', 'Match Listing', 'Joined'];
    const rows = filteredUsers.map(u => {
      const isMatchReady = u.profile && u.isActive && !u.isBanned && u.profile.isPublished;
      return [
        u.id, u.email,
        u.profile ? formatProfileName(u.profile) : 'Profile',
        u.role, u.isBanned ? 'Banned' : u.isActive ? 'Active' : 'Inactive',
        isMatchReady ? 'Listed' : 'Not Listed',
        new Date(u.createdAt).toLocaleDateString(),
      ];
    });
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Export Successful', description: `${filteredUsers.length} users exported` });
  };

  const hasFilters = searchQuery !== '' || roleFilter !== 'all' || statusFilter !== 'all' || matchFilter !== 'all';

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
            onClick={() => setIsCreateUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Profile</span>
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
                    <DropdownMenuItem onClick={handleBulkUnban} className="text-emerald-400 focus:text-emerald-400 focus:bg-emerald-500/10">Unban Selected</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/[0.06]" />
                    <DropdownMenuItem onClick={() => setBulkPermanentDeleteConfirm(true)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10 font-bold">PERMANENT DELETE</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  disabled={isBulkProcessing}
                  onClick={() => setBulkDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Ban className="w-3 h-3" /> Soft-Delete Selected
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
              <Select value={matchFilter} onValueChange={setMatchFilter}>
                <SelectTrigger className="w-[125px] bg-white/[0.05] border-white/[0.08] text-white rounded-xl">
                  <SelectValue placeholder="Match Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Match Status</SelectItem>
                  <SelectItem value="listed">Listed</SelectItem>
                  <SelectItem value="not_listed">Not Listed</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <button onClick={() => { setSearchQuery(''); setRoleFilter('all'); setStatusFilter('all'); setMatchFilter('all'); }} className="p-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-muted-foreground hover:text-white transition-colors">
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
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Match Listing</th>
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
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="w-14 h-5 skeleton-pulse rounded-full" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="w-14 h-5 skeleton-pulse rounded-full" /></td>
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
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex items-center justify-center flex-shrink-0 bg-white/5">
                          {user.profilePicture ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-semibold text-purple-300">
                              {user.profile ? user.profile.firstName?.charAt(0)?.toUpperCase() : user.email?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            className="text-sm font-medium text-white hover:text-purple-300 transition-colors text-left"
                          >
                            {user.profile ? formatProfileName(user.profile) : 'Profile'}
                          </button>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-3.5 hidden sm:table-cell"><StatusBadge user={user} /></td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><MatchStatusBadge user={user} /></td>
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
                          <DropdownMenuItem onClick={() => setUserToDelete(user)} className="text-amber-400 focus:text-amber-400 focus:bg-amber-500/10 gap-2 cursor-pointer">
                            <Ban className="w-3.5 h-3.5" /> Soft-Delete (Ban)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setUserToPermanentlyDelete(user)} className="text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 gap-2 cursor-pointer font-black">
                            <Trash2 className="w-3.5 h-3.5" /> Permanent Delete
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
              <AlertTriangle className="w-5 h-5 text-red-400" /> Ban User
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will ban <strong className="text-white">{userToDelete?.email}</strong>. They will no longer be able to access their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Reason for Ban</label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="e.g. FAKE_PROFILE, harassment, etc."
              className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/10 text-white hover:bg-white/15">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700 text-white">Ban User</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Soft-Delete {selectedUsers.size} Users?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deleting these users will restrict their access (Ban). Their profiles will no longer be visible to others.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Common Reason for Bulk Ban</label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="e.g. cleanup, massive reports, etc."
              className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkProcessing} className="bg-white/10 border-white/10 text-white hover:bg-white/15">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isBulkProcessing} className="bg-red-600 hover:bg-red-700 text-white">
              {isBulkProcessing ? 'Restricting...' : `Restrict Access for ${selectedUsers.size} Users`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Permanent Delete */}
      <AlertDialog open={bulkPermanentDeleteConfirm} onOpenChange={setBulkPermanentDeleteConfirm}>
        <AlertDialogContent className="bg-card border-border border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-6 h-6 animate-pulse" /> PERMANENT BULK DELETE
            </AlertDialogTitle>
            <AlertDialogDescription className="text-rose-200/60 font-bold">
              This action is IRREVERSIBLE. You are about to permanently delete {selectedUsers.size} users and ALL their associated profile data, messages, and matches from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkProcessing} className="bg-white/10 border-white/10 text-white hover:bg-white/15 border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkPermanentDelete}
              disabled={isBulkProcessing}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20"
            >
              {isBulkProcessing ? 'Deleting...' : `Yes, Delete ${selectedUsers.size} Users Permanently`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Permanent Delete */}
      <AlertDialog open={!!userToPermanentlyDelete} onOpenChange={() => setUserToPermanentlyDelete(null)}>
        <AlertDialogContent className="bg-card border-border border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-6 h-6 animate-pulse" /> Permanent Account Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-rose-200/60 font-bold">
              You are about to permanently delete <strong className="text-white">{userToPermanentlyDelete?.email}</strong>.
              This will remove everything associated with this user from the production database forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/10 text-white hover:bg-white/15 border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDeleteUser}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20"
            >
              Permanently Remove User
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

      {/* Create User & Profile Modal */}
      <AlertDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <AlertDialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <AlertDialogHeader className="border-b border-white/5 pb-4">
            <AlertDialogTitle className="flex items-center gap-2 text-white text-xl">
              <UserPlus className="w-6 h-6 text-primary" /> Create User Profile
            </AlertDialogTitle>
            <AlertDialogDescription>
              Create a new user account and their basic profile details.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex-1 overflow-y-auto py-6 px-1 space-y-8 no-scrollbar">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary/80 border-l-2 border-primary pl-3">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Phone Number *</label>
                  <div className="flex gap-2">
                    <input
                      value={newUserData.countryCode}
                      onChange={(e) => setNewUserData({...newUserData, countryCode: e.target.value})}
                      className="w-16 h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                      placeholder="+91"
                    />
                    <input
                      value={newUserData.phone}
                      onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                      className="flex-1 h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                      placeholder="10 digit phone number"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Email Address (Optional)</label>
                  <input
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="example@mail.com"
                  />
                </div>
              </div>
            </div>

            {/* Basic Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary/80 border-l-2 border-primary pl-3">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">First Name *</label>
                  <input
                    value={newUserData.firstName}
                    onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="First Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Last Name</label>
                  <input
                    value={newUserData.lastName}
                    onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="Last Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Gender *</label>
                  <Select value={newUserData.gender} onValueChange={(v) => setNewUserData({...newUserData, gender: v})}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={newUserData.dateOfBirth}
                    onChange={(e) => setNewUserData({...newUserData, dateOfBirth: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Marital Status</label>
                  <Select value={newUserData.maritalStatus} onValueChange={(v) => setNewUserData({...newUserData, maritalStatus: v})}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="NEVER_MARRIED">Never Married</SelectItem>
                      <SelectItem value="DIVORCED">Divorced</SelectItem>
                      <SelectItem value="WIDOWED">Widowed</SelectItem>
                      <SelectItem value="AWAITING_DIVORCE">Awaiting Divorce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Mother Tongue</label>
                  <Select value={newUserData.motherTongue} onValueChange={(v) => setNewUserData({...newUserData, motherTongue: v})}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-[300px]">
                      <SelectItem value="CHHATTISGARHI">Chhattisgarhi</SelectItem>
                      <SelectItem value="HINDI">Hindi</SelectItem>
                      <SelectItem value="ENGLISH">English</SelectItem>
                      <SelectItem value="MARATHI">Marathi</SelectItem>
                      <SelectItem value="ODIA">Odia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Religious & Location Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary/80 border-l-2 border-primary pl-3">Religious & Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Religion</label>
                  <Select value={newUserData.religion} onValueChange={(v) => setNewUserData({...newUserData, religion: v})}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="HINDU">Hindu</SelectItem>
                      <SelectItem value="MUSLIM">Muslim</SelectItem>
                      <SelectItem value="SIKH">Sikh</SelectItem>
                      <SelectItem value="CHRISTIAN">Christian</SelectItem>
                      <SelectItem value="JAIN">Jain</SelectItem>
                      <SelectItem value="BUDDHIST">Buddhist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Caste / Sub-Caste (Optional)</label>
                  <input
                    value={newUserData.caste}
                    onChange={(e) => setNewUserData({...newUserData, caste: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="e.g. Sahu, Verma..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Native Village (Optional)</label>
                  <input
                    value={newUserData.nativeVillage}
                    onChange={(e) => setNewUserData({...newUserData, nativeVillage: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="Village Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">City *</label>
                  <input
                    value={newUserData.city}
                    onChange={(e) => setNewUserData({...newUserData, city: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="Current City"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">State</label>
                  <input
                    value={newUserData.state}
                    onChange={(e) => setNewUserData({...newUserData, state: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="State"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6 px-1">
                   <Checkbox
                     checked={newUserData.speaksChhattisgarhi}
                     onCheckedChange={(checked) => setNewUserData({...newUserData, speaksChhattisgarhi: !!checked})}
                     className="border-white/20"
                   />
                   <span className="text-xs font-medium text-white">Speaks Chhattisgarhi</span>
                </div>
              </div>
            </div>

            {/* Professional & Physical Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary/80 border-l-2 border-primary pl-3">Professional & Physical</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Highest Education</label>
                  <input
                    value={newUserData.highestEducation}
                    onChange={(e) => setNewUserData({...newUserData, highestEducation: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="e.g. B.Tech, MBA..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Occupation</label>
                  <input
                    value={newUserData.occupation}
                    onChange={(e) => setNewUserData({...newUserData, occupation: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="e.g. Software Engineer..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Annual Income</label>
                  <input
                    value={newUserData.annualIncome}
                    onChange={(e) => setNewUserData({...newUserData, annualIncome: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="e.g. 5 LPA, 8-10 LPA, ₹12,00,000 per year"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Height</label>
                  <Select value={newUserData.height} onValueChange={(v) => setNewUserData({...newUserData, height: v})}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue placeholder="Select Height" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-[300px]">
                      {HEIGHT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Family & About */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary/80 border-l-2 border-primary pl-3">Family & About</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Father&apos;s Occupation</label>
                  <input
                    value={newUserData.fatherOccupation}
                    onChange={(e) => setNewUserData({...newUserData, fatherOccupation: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="e.g. retired, business..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Family Income</label>
                  <input
                    value={newUserData.familyIncome}
                    onChange={(e) => setNewUserData({...newUserData, familyIncome: e.target.value})}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="Annual family income"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">About Profile (Bio)</label>
                  <textarea
                    value={newUserData.bio}
                    onChange={(e) => setNewUserData({...newUserData, bio: e.target.value})}
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all resize-none"
                    placeholder="Short introduction about the person..."
                  />
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="border-t border-white/5 pt-4">
            <AlertDialogCancel className="bg-white/10 border-white/10 text-white hover:bg-white/15 h-11 px-6 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleCreateUser(); }}
              disabled={isCreatingUser}
              className="bg-primary hover:bg-primary/90 text-white h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              {isCreatingUser ? 'Creating...' : 'Create Profile'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
