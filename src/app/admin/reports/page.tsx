'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, RefreshCw, ChevronLeft, ChevronRight, Download, CheckCircle, XCircle, FileWarning, X, Flag, Ban } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { reportsService } from "@/services/reports.service";
import { adminService } from "@/services/admin.service";
import type { Report, ReportStatus } from "@/types/api.types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const STATUS_BADGES: Record<ReportStatus, string> = {
  PENDING: 'bg-gold/20 text-primaryDark border-gold/35',
  UNDER_REVIEW: 'bg-primary/10 text-primary border-primary/25',
  RESOLVED: 'bg-success/10 text-success border-success/25',
  DISMISSED: 'bg-muted text-muted-foreground border-border',
  ESCALATED: 'bg-error/10 text-error border-error/25',
};

const REASON_STYLES = 'bg-primary/10 text-primary border-primary/25';

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
      const data = await reportsService.getReports(page, 10, statusFilter === 'ALL' ? undefined : statusFilter);
      setReports(data.reports || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to load reports' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchReports(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleStatusChange = async (reportId: number, newStatus: ReportStatus) => {
    try {
      await reportsService.updateReport(reportId.toString(), { status: newStatus });
      toast({ title: 'Status Updated', description: `Report marked as ${newStatus.replace(/_/g, ' ').toLowerCase()}` });
      fetchReports(pagination.page);
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to update report' });
    }
  };

  const toggleSelectAll = () => {
    if (selectedReports.size === reports.length) setSelectedReports(new Set());
    else setSelectedReports(new Set(reports.map(r => r.id)));
  };
  const toggleSelectReport = (id: number) => {
    const next = new Set(selectedReports);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedReports(next);
  };

  const handleBulkStatusChange = async (newStatus: ReportStatus) => {
    setIsBulkProcessing(true);
    let success = 0, failed = 0;
    for (const id of selectedReports) {
      try { await reportsService.updateReport(id.toString(), { status: newStatus }); success++; }
      catch { failed++; }
    }
    setIsBulkProcessing(false);
    setSelectedReports(new Set());
    toast({ title: 'Bulk Update Complete', description: `${success} updated${failed > 0 ? `, ${failed} failed` : ''}` });
    fetchReports(pagination.page);
  };

  const handleBulkDelete = async () => {
    setIsBulkProcessing(true);
    try {
      await adminService.bulkModeration(Array.from(selectedReports), 'reports', 'delete');
      toast({ title: 'Bulk Delete Complete', description: `Deleted ${selectedReports.size} reports` });
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to delete reports' });
    } finally {
      setIsBulkProcessing(false);
      setSelectedReports(new Set());
      fetchReports(1);
    }
  };

  const handleBulkApprove = async () => {
    setIsBulkProcessing(true);
    try {
      await adminService.bulkModeration(Array.from(selectedReports), 'reports', 'approve');
      toast({ title: 'Bulk Approve Complete', description: `Resolved ${selectedReports.size} reports` });
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to approve reports' });
    } finally {
      setIsBulkProcessing(false);
      setSelectedReports(new Set());
      fetchReports(1);
    }
  };

  const handleBanUser = async (userId: number, reason: string, reportId: number) => {
    if (!confirm(`Ban this user?`)) return;
    try {
      await adminService.banUser(userId.toString(), `Ban via report #${reportId}: ${reason}`);
      await reportsService.updateReport(reportId.toString(), { status: 'RESOLVED' as ReportStatus, actionTaken: 'USER_BANNED' });
      toast({ title: 'User Banned', description: 'User banned and report resolved' });
      fetchReports(pagination.page);
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed' });
    }
  };

  const exportToCSV = () => {
    const data = selectedReports.size > 0 ? reports.filter(r => selectedReports.has(r.id)) : reports;
    const headers = ['ID', 'Reporter', 'Reported User', 'Reason', 'Status', 'Description', 'Date'];
    const rows = data.map(r => [
      r.id, r.reporter?.email || 'Unknown', r.reportedUser?.email || 'Unknown',
      r.reason, r.status, r.description || '', new Date(r.createdAt).toLocaleDateString()
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Exported', description: `${data.length} reports exported` });
  };

  const getUserName = (user: { profile?: { firstName: string; lastName: string }; email?: string }) => {
    if (user?.profile) return `${user.profile.firstName} ${user.profile.lastName}`;
    return user?.email?.split('@')[0] || 'Unknown';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>Report Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? 'Loading...' : `${pagination.total} total reports`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            disabled={isLoading || reports.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background hover:bg-background text-foreground text-sm font-medium transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => fetchReports(pagination.page)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background hover:bg-background text-foreground text-sm font-medium transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="admin-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border space-y-3">
          {/* Bulk Actions */}
          {selectedReports.size > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gold/20 border border-gold/35">
              <Flag className="w-4 h-4 text-primaryDark flex-shrink-0" />
              <span className="text-sm font-semibold text-primaryDark">{selectedReports.size} selected</span>
              <div className="h-4 w-px bg-background" />
              <div className="flex gap-2 flex-wrap">
                <button disabled={isBulkProcessing} onClick={handleBulkApprove} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 hover:bg-success/10 text-success text-xs font-medium transition-colors disabled:opacity-50">
                  <CheckCircle className="w-3 h-3" /> Approve All
                </button>
                <button disabled={isBulkProcessing} onClick={() => handleBulkStatusChange('DISMISSED' as ReportStatus)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted text-muted-foreground text-xs font-medium transition-colors disabled:opacity-50">
                  <XCircle className="w-3 h-3" /> Dismiss All
                </button>
                <button disabled={isBulkProcessing} onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error/10 hover:bg-error/10 text-error text-xs font-medium transition-colors disabled:opacity-50">
                  <Ban className="w-3 h-3" /> Delete All
                </button>
              </div>
              <button onClick={() => setSelectedReports(new Set())} className="ml-auto text-muted-foreground hover:text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReportStatus | 'ALL')}>
            <SelectTrigger className="w-[170px] bg-background border-border text-foreground rounded-xl">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="ALL">All Reports</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="DISMISSED">Dismissed</SelectItem>
              <SelectItem value="ESCALATED">Escalated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th className="w-10 px-4 py-3.5 text-left">
                  <Checkbox checked={selectedReports.size === reports.length && reports.length > 0} onCheckedChange={toggleSelectAll} className="border-border" />
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Reporter</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Reported User</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Reason</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><div className="w-4 h-4 skeleton-pulse rounded" /></td>
                    {[140, 140, 100, 160, 80, 70].map((w, j) => (
                      <td key={j} className="px-4 py-3"><div className={`w-${w} h-3.5 skeleton-pulse rounded`} style={{ width: w }} /></td>
                    ))}
                    <td className="px-4 py-3"><div className="w-8 h-8 skeleton-pulse rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <FileWarning className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No reports found</p>
                  </td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id} className={`border-b border-border transition-colors ${selectedReports.has(report.id) ? 'bg-gold/20' : ''}`}>
                    <td className="px-4 py-3.5">
                      <Checkbox checked={selectedReports.has(report.id)} onCheckedChange={() => toggleSelectReport(report.id)} className="border-border" />
                    </td>
                    <td className="px-4 py-3.5">
                      {report.reporter?.id === report.reportedUser?.id ? (
                        <span className="text-xs font-bold text-primaryDark bg-gold/20 px-2 py-0.5 rounded border border-gold/35">SYSTEM FLAG</span>
                      ) : (
                        <span className="text-sm text-foreground font-medium">{getUserName(report.reporter)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-foreground font-medium">{getUserName(report.reportedUser)}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${REASON_STYLES}`}>
                        {report.reason.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-xs text-muted-foreground max-w-[160px] truncate" title={report.description}>
                        {report.description || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGES[report.status] || STATUS_BADGES.PENDING}`}>
                        {report.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-primary transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border w-48">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Update Status</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-background" />
                          <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'UNDER_REVIEW' as ReportStatus)} className="cursor-pointer text-primary focus:text-primary focus:bg-primary/10">Mark Under Review</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'RESOLVED' as ReportStatus)} className="cursor-pointer text-success focus:text-success focus:bg-success/10">Mark Resolved</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'DISMISSED' as ReportStatus)} className="cursor-pointer text-muted-foreground focus:bg-muted">Dismiss</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'ESCALATED' as ReportStatus)} className="cursor-pointer text-error focus:text-error focus:bg-error/10">Escalate</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-background" />
                          <DropdownMenuItem onClick={() => handleBanUser(report.reportedUserId, report.reason, report.id)} className="cursor-pointer text-error focus:text-error focus:bg-error/10 gap-2 font-semibold">
                            <Ban className="w-3.5 h-3.5" /> Ban Reported User
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
        <div className="flex items-center justify-between px-4 py-3.5 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing {reports.length} of {pagination.total} reports
          </p>
          <div className="flex gap-1.5">
            <button onClick={() => fetchReports(pagination.page - 1)} disabled={pagination.page <= 1 || isLoading} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-background text-foreground text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button onClick={() => fetchReports(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages || isLoading} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-background text-foreground text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
