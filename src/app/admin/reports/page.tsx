'use client';

import { useEffect, useState } from 'react';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, RefreshCw, ChevronLeft, ChevronRight, Download, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportsService } from "@/services/reports.service";
import type { Report, ReportStatus } from "@/types/api.types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<ReportStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PENDING: 'secondary',
    UNDER_REVIEW: 'outline',
    RESOLVED: 'default',
    DISMISSED: 'destructive',
    ESCALATED: 'destructive',
};

export default function AdminReportsPage() {
    const { toast } = useToast();
    const [reports, setReports] = useState<Report[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
    const [selectedReports, setSelectedReports] = useState<Set<number>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const fetchReports = async (page = 1) => {
        setIsLoading(true);
        setSelectedReports(new Set());
        try {
            const data = await reportsService.getReports(
                page,
                10,
                statusFilter === 'ALL' ? undefined : statusFilter
            );
            setReports(data.reports || []);
            setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
        } catch (err: any) {
            console.error('Failed to fetch reports:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to load reports',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [statusFilter]);

    const handleStatusChange = async (reportId: number, newStatus: ReportStatus) => {
        try {
            await reportsService.updateReport(reportId.toString(), { status: newStatus });
            toast({
                title: 'Success',
                description: 'Report status updated successfully',
            });
            fetchReports(pagination.page);
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to update report',
            });
        }
    };

    // Bulk selection handlers
    const toggleSelectAll = () => {
        if (selectedReports.size === reports.length) {
            setSelectedReports(new Set());
        } else {
            setSelectedReports(new Set(reports.map(r => r.id)));
        }
    };

    const toggleSelectReport = (reportId: number) => {
        const newSelected = new Set(selectedReports);
        if (newSelected.has(reportId)) {
            newSelected.delete(reportId);
        } else {
            newSelected.add(reportId);
        }
        setSelectedReports(newSelected);
    };

    // Bulk status update
    const handleBulkStatusChange = async (newStatus: ReportStatus) => {
        setIsBulkProcessing(true);
        let successCount = 0;
        let errorCount = 0;

        for (const reportId of selectedReports) {
            try {
                await reportsService.updateReport(reportId.toString(), { status: newStatus });
                successCount++;
            } catch {
                errorCount++;
            }
        }

        setIsBulkProcessing(false);
        setSelectedReports(new Set());

        toast({
            title: 'Bulk Update Complete',
            description: `Updated ${successCount} reports${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });

        fetchReports(pagination.page);
    };

    // CSV Export
    const exportToCSV = () => {
        const headers = ['ID', 'Reporter', 'Reported User', 'Reason', 'Status', 'Description', 'Date'];
        const dataToExport = selectedReports.size > 0
            ? reports.filter(r => selectedReports.has(r.id))
            : reports;

        const rows = dataToExport.map(report => [
            report.id,
            report.reporter?.email || 'Unknown',
            report.reportedUser?.email || 'Unknown',
            report.reason,
            report.status,
            report.description?.replace(/"/g, '""') || '',
            new Date(report.createdAt).toLocaleDateString(),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reports_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        toast({ title: 'Success', description: `Exported ${dataToExport.length} reports to CSV` });
    };

    return (
        <AdminPageWrapper>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <CardTitle>Report Management</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={isLoading || reports.length === 0}>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => fetchReports(pagination.page)} disabled={isLoading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    {selectedReports.size > 0 && (
                        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg mb-4">
                            <span className="text-sm font-medium">{selectedReports.size} selected</span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBulkStatusChange('RESOLVED' as ReportStatus)}
                                    disabled={isBulkProcessing}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    Bulk Resolve
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBulkStatusChange('DISMISSED' as ReportStatus)}
                                    disabled={isBulkProcessing}
                                >
                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                    Bulk Dismiss
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBulkStatusChange('ESCALATED' as ReportStatus)}
                                    disabled={isBulkProcessing}
                                >
                                    <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                                    Bulk Escalate
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedReports(new Set())}
                            >
                                Clear Selection
                            </Button>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReportStatus | 'ALL')}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Reports</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                                <SelectItem value="DISMISSED">Dismissed</SelectItem>
                                <SelectItem value="ESCALATED">Escalated</SelectItem>
                            </SelectContent>
                        </Select>
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
                                                checked={selectedReports.size === reports.length && reports.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Reporter</TableHead>
                                        <TableHead>Reported User</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden md:table-cell">Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                                No reports found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reports.map(report => (
                                            <TableRow key={report.id} className={selectedReports.has(report.id) ? 'bg-muted/50' : ''}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedReports.has(report.id)}
                                                        onCheckedChange={() => toggleSelectReport(report.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {report.reporter?.profile
                                                            ? `${report.reporter.profile.firstName} ${report.reporter.profile.lastName}`
                                                            : report.reporter?.email?.split('@')[0] || 'Unknown'
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {report.reportedUser?.profile
                                                            ? `${report.reportedUser.profile.firstName} ${report.reportedUser.profile.lastName}`
                                                            : report.reportedUser?.email?.split('@')[0] || 'Unknown'
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{report.reason.replace('_', ' ')}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={statusColors[report.status]}>
                                                        {report.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground">
                                                    {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'UNDER_REVIEW' as ReportStatus)}>
                                                                Mark Under Review
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'RESOLVED' as ReportStatus)}>
                                                                Mark Resolved
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'DISMISSED' as ReportStatus)}>
                                                                Dismiss Report
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'ESCALATED' as ReportStatus)}>
                                                                Escalate
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
                                    Showing {reports.length} of {pagination.total} reports
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchReports(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Prev
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchReports(pagination.page + 1)}
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
        </AdminPageWrapper>
    );
}
