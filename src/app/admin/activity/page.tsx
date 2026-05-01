'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, UserPlus, Shield, AlertTriangle, CheckCircle, XCircle, Trash2, Settings, LogIn, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from "@/stores/auth-store";
import { apiConfig, getAuthHeaders } from "@/lib/api.config";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ActivityLog } from "@/types/api.types";

interface ActivityStats {
    totalLogs: number;
    todayLogs: number;
    weekLogs: number;
    topActions: { action: string; count: number }[];
}

const getActionIcon = (action: string) => {
    if (action.includes('CREATED') || action.includes('USER_CREATED')) {
        return <UserPlus className="h-4 w-4 text-success" />;
    }
    if (action.includes('DELETED')) {
        return <Trash2 className="h-4 w-4 text-error" />;
    }
    if (action.includes('VERIFIED') || action.includes('APPROVED')) {
        return <CheckCircle className="h-4 w-4 text-success" />;
    }
    if (action.includes('REJECTED') || action.includes('BANNED')) {
        return <XCircle className="h-4 w-4 text-error" />;
    }
    if (action.includes('ROLE')) {
        return <Shield className="h-4 w-4 text-primary" />;
    }
    if (action.includes('LOGIN')) {
        return <LogIn className="h-4 w-4 text-primary" />;
    }
    if (action.includes('REPORT')) {
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    if (action.includes('BULK')) {
        return <Users className="h-4 w-4 text-primary" />;
    }
    return <Settings className="h-4 w-4 text-gray-500" />;
};

const getActionBadgeVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (action.includes('DELETED') || action.includes('BANNED') || action.includes('REJECTED')) {
        return 'destructive';
    }
    if (action.includes('CREATED') || action.includes('VERIFIED') || action.includes('APPROVED')) {
        return 'default';
    }
    return 'secondary';
};

export default function AdminActivityPage() {
    const { toast } = useToast();
    const { accessToken } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [stats, setStats] = useState<ActivityStats | null>(null);
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchActivityLogs = useCallback(async (pageNum = 1) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: '20',
            });

            if (actionFilter && actionFilter !== 'all') {
                params.append('action', actionFilter); // CHANGED: actionType -> action
            }

            const response = await fetch(
                `${apiConfig.baseUrl}${apiConfig.endpoints.admin.activityLogs}?${params}`,
                { headers: getAuthHeaders(accessToken || undefined) }
            );

            if (!response.ok) throw new Error('Failed to fetch logs');

            const data = await response.json();
            setLogs(data.logs || []);
            setPage(data.pagination?.page || 1);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err) {
            const error = err as Error;
            console.error('Failed to fetch activity logs:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to load activity logs',
            });
        } finally {
            setIsLoading(false);
        }
    }, [accessToken, actionFilter, toast]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch(
                `${apiConfig.baseUrl}${apiConfig.endpoints.admin.activityLogsStats}`,
                { headers: getAuthHeaders(accessToken || undefined) }
            );

            if (!response.ok) throw new Error('Failed to fetch stats');

            const data = await response.json();
            setStats(data.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchActivityLogs();
        fetchStats();
    }, [fetchActivityLogs, fetchStats]);

    useEffect(() => {
        fetchActivityLogs(1);
    }, [fetchActivityLogs]); // actionFilter is already in fetchActivityLogs dependencies via useCallback

    return (
        <AdminPageWrapper>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Activity Log</h1>
                        <p className="text-muted-foreground">Admin action audit trail</p>
                    </div>
                    <div className="flex gap-2">
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="USER_CREATED">User Created</SelectItem>
                                <SelectItem value="USER_DELETED">User Deleted</SelectItem>
                                <SelectItem value="USER_ROLE_CHANGED">Role Changed</SelectItem>
                                <SelectItem value="USER_BANNED">User Banned</SelectItem>
                                <SelectItem value="PROFILE_VERIFIED">Profile Verified</SelectItem>
                                <SelectItem value="PROFILE_REJECTED">Profile Rejected</SelectItem>
                                <SelectItem value="REPORT_RESOLVED">Report Resolved</SelectItem>
                                <SelectItem value="ADMIN_LOGIN">Admin Login</SelectItem>
                                <SelectItem value="BULK_ACTION">Bulk Actions</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => fetchActivityLogs(page)} disabled={isLoading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Logs</CardDescription>
                                <CardTitle className="text-2xl">{(stats.totalLogs || 0).toLocaleString()}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Today</CardDescription>
                                <CardTitle className="text-2xl">{(stats.todayLogs || 0).toLocaleString()}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>This Week</CardDescription>
                                <CardTitle className="text-2xl">{(stats.weekLogs || 0).toLocaleString()}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Timeline of admin actions and system events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-start space-x-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No activity logs yet. Actions will appear here once admins start performing operations.</p>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

                                <div className="space-y-6">
                                    {logs.map((log) => (
                                        <div key={log.id} className="relative flex items-start gap-4 pl-12">
                                            {/* Timeline dot */}
                                            <div className="absolute left-0 w-10 h-10 rounded-full bg-background border-2 border-border flex items-center justify-center">
                                                {getActionIcon(log.action)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-medium">{log.action.replace(/_/g, ' ')}</p>
                                                    <Badge variant={getActionBadgeVariant(log.action)}>
                                                        {log.action}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {log.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span>
                                                        By: {log.user?.profile
                                                            ? `${log.user.profile.firstName} ${log.user.profile.lastName}`
                                                            : log.user?.email || 'System'}
                                                    </span>
                                                    {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                                                    <span>
                                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchActivityLogs(page - 1)}
                                    disabled={page <= 1 || isLoading}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-3 text-sm text-muted-foreground">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchActivityLogs(page + 1)}
                                    disabled={page >= totalPages || isLoading}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageWrapper>
    );
}
