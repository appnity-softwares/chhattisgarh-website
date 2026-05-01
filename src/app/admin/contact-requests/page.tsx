'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Search, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, XCircle, Ban, Filter, Users, Mail, Clock } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminPageWrapper } from '@/app/admin/admin-page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin.service';
import type { ContactRequest, ContactRequestStatus } from '@/types/api.types';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STATUS_BADGES: Record<ContactRequestStatus, string> = {
  PENDING: 'bg-gold/20 text-primaryDark border-gold/35',
  APPROVED: 'bg-success/10 text-success border-success/25',
  REJECTED: 'bg-error/10 text-error border-error/25',
};

const STATUS_LABELS: Record<ContactRequestStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export default function AdminContactRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number }>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ContactRequestStatus | 'ALL'>('ALL' as ContactRequestStatus | 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'block';
    requestId?: number;
    userId?: number;
  }>({ isOpen: false, type: 'approve' });

  const fetchRequests = useCallback(async (page = 1) => {
    setIsLoading(true);
    setSelectedRequests(new Set());
    try {
      const data = await adminService.getContactRequests(page, 10, statusFilter === 'ALL' ? undefined : statusFilter, searchQuery);
      setRequests(data.requests || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 } as { page: number; limit: number; total: number; totalPages: number });
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to load contact requests' });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (requestId: number) => {
    try {
      await adminService.updateContactRequest(requestId, 'APPROVED', 'Approved by admin');
      toast({ title: 'Success', description: 'Contact request approved' });
      fetchRequests();
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to approve request' });
    }
  };

  const _handleReject = async (requestId: number, reason: string) => {
    try {
      await adminService.updateContactRequest(requestId, 'REJECTED', reason);
      toast({ title: 'Success', description: 'Contact request rejected' });
      fetchRequests();
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to reject request' });
    }
  };

  const handleBlockUser = async (userId: number) => {
    try {
      await adminService.banUser(userId.toString(), 'Blocked due to inappropriate contact requests');
      toast({ title: 'Success', description: 'User blocked successfully' });
      fetchRequests();
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to block user' });
    }
  };

  const handleBulkAction = async () => {
    if (selectedRequests.size === 0) return;
    
    setIsBulkProcessing(true);
    try {
      if (actionDialog.type === 'approve') {
        for (const requestId of selectedRequests) {
          await adminService.updateContactRequest(requestId, 'APPROVED', 'Bulk approved by admin');
        }
        toast({ title: 'Success', description: `${selectedRequests.size} requests approved` });
      } else if (actionDialog.type === 'reject') {
        for (const requestId of selectedRequests) {
          await adminService.updateContactRequest(requestId, 'REJECTED', 'Bulk rejected by admin');
        }
        toast({ title: 'Success', description: `${selectedRequests.size} requests rejected` });
      }
      
      setSelectedRequests(new Set());
      fetchRequests();
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to process bulk action' });
    } finally {
      setIsBulkProcessing(false);
      setActionDialog({ isOpen: false, type: 'approve' });
    }
  };

  return (
    <AdminPageWrapper
      title="Contact Requests"
      description="Monitor and manage user contact requests"
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Search Users</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => fetchRequests()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedRequests.size > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedRequests.size} request{selectedRequests.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={() => setActionDialog({ isOpen: true, type: 'approve' })}
                    disabled={isBulkProcessing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Selected
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setActionDialog({ isOpen: true, type: 'reject' })}
                    disabled={isBulkProcessing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Requests ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No contact requests found</h3>
                <p className="text-muted-foreground mt-2">
                  {statusFilter === 'ALL' 
                    ? 'No contact requests match your current filters' 
                    : `No ${statusFilter.toLowerCase()} contact requests found`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRequests.size === requests.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRequests(new Set(requests.map(r => r.id)));
                            } else {
                              setSelectedRequests(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Receiver</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRequests.has(request.id)}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedRequests);
                              if (checked) {
                                newSelected.add(request.id);
                              } else {
                                newSelected.delete(request.id);
                              }
                              setSelectedRequests(newSelected);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{request.sender?.profile?.firstName} {request.sender?.profile?.lastName}</div>
                              <div className="text-sm text-muted-foreground">{request.sender?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                              <Users className="w-4 h-4 text-secondary" />
                            </div>
                            <div>
                              <div className="font-medium">{request.receiver?.profile?.firstName} {request.receiver?.profile?.lastName}</div>
                              <div className="text-sm text-muted-foreground">{request.receiver?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={request.message}>
                            {request.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_BADGES[request.status]}>
                            {STATUS_LABELS[request.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleApprove(request.id)}
                                disabled={request.status === 'APPROVED'}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ isOpen: true, type: 'reject', requestId: request.id })}
                                disabled={request.status === 'REJECTED'}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleBlockUser(request.senderId)}
                                className="text-destructive"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Block Sender
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchRequests(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchRequests(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={actionDialog.isOpen} onOpenChange={(open) => setActionDialog({ ...actionDialog, isOpen: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.type === 'approve' ? 'Approve Contact Requests' : 'Reject Contact Requests'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.type === 'approve' 
                ? `Are you sure you want to approve ${selectedRequests.size} contact request${selectedRequests.size > 1 ? 's' : ''}?`
                : `Are you sure you want to reject ${selectedRequests.size} contact request${selectedRequests.size > 1 ? 's' : ''}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              disabled={isBulkProcessing}
              className={actionDialog.type === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isBulkProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionDialog.type === 'approve' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </>
                  )}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageWrapper>
  );
}
