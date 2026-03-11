'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, Database, FileText, Clock, User } from 'lucide-react';

interface AuditLog {
    id: number;
    tableName: string;
    recordId: number;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    changedFields: string | null;
    changedBy: number | null;
    changedByType: string;
    changedAt: string;
    ipAddress: string | null;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tableFilter, setTableFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, [tableFilter, actionFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call when backend is ready
            // const response = await fetch('/api/admin/audit-logs');
            // const data = await response.json();
            // setLogs(data.logs || []);

            // Mock data for development
            await new Promise(resolve => setTimeout(resolve, 500));
            setLogs([
                { id: 1, tableName: 'users', recordId: 123, action: 'UPDATE', changedFields: 'email, phone', changedBy: 1, changedByType: 'ADMIN', changedAt: new Date().toISOString(), ipAddress: '192.168.1.1' },
                { id: 2, tableName: 'profiles', recordId: 456, action: 'INSERT', changedFields: null, changedBy: 2, changedByType: 'USER', changedAt: new Date(Date.now() - 3600000).toISOString(), ipAddress: '10.0.0.1' },
                { id: 3, tableName: 'subscriptions', recordId: 789, action: 'UPDATE', changedFields: 'status', changedBy: 1, changedByType: 'SYSTEM', changedAt: new Date(Date.now() - 7200000).toISOString(), ipAddress: null },
                { id: 4, tableName: 'payments', recordId: 101, action: 'INSERT', changedFields: null, changedBy: 5, changedByType: 'USER', changedAt: new Date(Date.now() - 86400000).toISOString(), ipAddress: '203.0.113.50' },
                { id: 5, tableName: 'profiles', recordId: 202, action: 'DELETE', changedFields: 'all', changedBy: 1, changedByType: 'ADMIN', changedAt: new Date(Date.now() - 172800000).toISOString(), ipAddress: '192.168.1.1' },
            ]);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'INSERT': return <Badge className="bg-green-500">INSERT</Badge>;
            case 'UPDATE': return <Badge className="bg-blue-500">UPDATE</Badge>;
            case 'DELETE': return <Badge className="bg-red-500">DELETE</Badge>;
            default: return <Badge>{action}</Badge>;
        }
    };

    const getChangedByBadge = (type: string) => {
        switch (type) {
            case 'ADMIN': return <Badge variant="outline" className="border-purple-500 text-purple-500">ADMIN</Badge>;
            case 'USER': return <Badge variant="outline" className="border-blue-500 text-blue-500">USER</Badge>;
            case 'SYSTEM': return <Badge variant="outline" className="border-gray-500 text-gray-500">SYSTEM</Badge>;
            default: return <Badge variant="outline">{type}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    };

    const filteredLogs = logs.filter(log =>
        log.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(log.recordId).includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Audit Logs</h1>
                    <p className="text-muted-foreground">Track all database changes for compliance and debugging</p>
                </div>
                <Button onClick={fetchLogs} variant="outline" size="icon">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{logs.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inserts</CardTitle>
                        <FileText className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {logs.filter(l => l.action === 'INSERT').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Updates</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">
                            {logs.filter(l => l.action === 'UPDATE').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deletes</CardTitle>
                        <User className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {logs.filter(l => l.action === 'DELETE').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by table or record ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={tableFilter} onValueChange={setTableFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Table" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tables</SelectItem>
                                <SelectItem value="users">Users</SelectItem>
                                <SelectItem value="profiles">Profiles</SelectItem>
                                <SelectItem value="subscriptions">Subscriptions</SelectItem>
                                <SelectItem value="messages">Messages</SelectItem>
                                <SelectItem value="payments">Payments</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="INSERT">Insert</SelectItem>
                                <SelectItem value="UPDATE">Update</SelectItem>
                                <SelectItem value="DELETE">Delete</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Changes</CardTitle>
                    <CardDescription>Last 100 database modifications</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Table</TableHead>
                                <TableHead>Record ID</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Changed Fields</TableHead>
                                <TableHead>Changed By</TableHead>
                                <TableHead>IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        No audit logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(log.changedAt)}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{log.tableName}</TableCell>
                                        <TableCell className="font-mono">{log.recordId}</TableCell>
                                        <TableCell>{getActionBadge(log.action)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                            {log.changedFields || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {getChangedByBadge(log.changedByType)}
                                                {log.changedBy && <span className="text-xs text-muted-foreground">ID: {log.changedBy}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {log.ipAddress || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
