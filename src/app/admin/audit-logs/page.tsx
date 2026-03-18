'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminService } from '@/services/admin.service';
import { Loader2, ShieldCheck, User, Clock, Activity, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AuditLogs() {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
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
        'CHANGE_ROLE': 'text-purple-600 bg-purple-50 border-purple-100',
        'TOGGLE_FEATURE': 'text-blue-600 bg-blue-50 border-blue-100',
        'APPROVE_PAYMENT': 'text-green-600 bg-green-50 border-green-100',
        'BAN_USER': 'text-red-600 bg-red-50 border-red-100'
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
                <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <Activity className="w-10 h-10 text-slate-400" />
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Actions</p>
                                <h3 className="text-2xl font-bold">{stats.total}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="w-10 h-10 text-blue-400" />
                            <div>
                                <p className="text-sm font-medium text-blue-500">Active Admins</p>
                                <h3 className="text-2xl font-bold">{stats.uniqueAdmins}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <Clock className="w-10 h-10 text-green-400" />
                            <div>
                                <p className="text-sm font-medium text-green-500">Actions Today</p>
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
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
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
                                            <TableCell className="text-xs italic text-muted-foreground">{log.details}</TableCell>
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
