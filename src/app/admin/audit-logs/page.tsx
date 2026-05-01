'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminService } from '@/services/admin.service';
import { Loader2, ShieldCheck, User, Clock, Activity, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AuditLogEntry {
    id: number;
    timestamp: string;
    admin: string;
    action: string;
    target: string;
    details: string;
}

export default function AuditLogs() {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [stats, setStats] = useState({ total: 0, uniqueAdmins: 0, todayActions: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [logsData, statsData] = await Promise.all([
                adminService.getAuditLogs(),
                adminService.getAuditLogsStats()
            ]);
            setLogs(logsData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const actionColors: Record<string, string> = {
        'CHANGE_ROLE': 'text-primary bg-primary/10 border-primary/25',
        'TOGGLE_FEATURE': 'text-primary bg-primary/10 border-primary/25',
        'APPROVE_PAYMENT': 'text-success bg-success/10 border-success/25',
        'BAN_USER': 'text-error bg-error/10 border-error/25'
    };

    const filteredLogs = (logs || []).filter(log => 
        log.admin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Audit logs</h1>
                <p className="text-muted-foreground">Track all administrative actions for security and accountability.</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-surface border-border">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <Activity className="w-10 h-10 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Actions</p>
                                <h3 className="text-2xl font-bold">{stats.total}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/10 border-primary/25">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="w-10 h-10 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-primary">Active Admins</p>
                                <h3 className="text-2xl font-bold">{stats.uniqueAdmins}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-success/10 border-success/25">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <Clock className="w-10 h-10 text-success" />
                            <div>
                                <p className="text-sm font-medium text-success">Actions Today</p>
                                <h3 className="text-2xl font-bold">{stats.todayActions}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Activity History</CardTitle>
                        <CardDescription>A real-time list of who did what and when.</CardDescription>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search logs..." 
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Admin</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Target</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-xs text-muted-foreground font-mono">
                                                {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                                            </TableCell>
                                            <TableCell className="font-semibold flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                {log.admin}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`text-[10px] ${actionColors[log.action] || ''}`} variant="outline">
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{log.target}</TableCell>
                                            <TableCell className="text-xs font-medium text-muted-foreground">{log.details}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
