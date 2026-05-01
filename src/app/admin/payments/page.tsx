'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  RefreshCw,
  Search,
  Wallet,
} from 'lucide-react';
import { AdminPageWrapper } from '@/app/admin/admin-page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/admin.service';
import type { PaymentRecord, PaymentStatus, PaymentSummary } from '@/types/api.types';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-success/10 text-success border-success/25',
  PENDING: 'bg-gold/20 text-primaryDark border-gold/35',
  FAILED: 'bg-error/10 text-error border-error/25',
  REFUNDED: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  CANCELLED: 'bg-muted text-muted-foreground border-border',
};

const EMPTY_SUMMARY: PaymentSummary = {
  totalPayments: 0,
  completedPayments: 0,
  pendingPayments: 0,
  failedPayments: 0,
  refundedPayments: 0,
  cancelledPayments: 0,
  completedRevenue: 0,
};

const toAmount = (value: number | string | null | undefined) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  return 0;
};

const getCustomerName = (payment: PaymentRecord) => {
  const firstName = payment.user.profile?.firstName?.trim();
  const lastName = payment.user.profile?.lastName?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return fullName || payment.user.email || payment.user.phone || `User #${payment.userId}`;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Failed to load payments';

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = async (
    page = 1,
    options?: {
      status?: 'all' | PaymentStatus;
      search?: string;
    }
  ) => {
    setIsLoading(true);
    try {
      const nextStatus = options?.status ?? statusFilter;
      const nextSearch = options?.search ?? searchQuery;
      const data = await adminService.getPayments({
        page,
        limit: 10,
        status: nextStatus,
        search: nextSearch,
      });

      setPayments(data.payments || []);
      setSummary(data.summary || EMPTY_SUMMARY);
      setPagination({
        page: data.pagination?.page || 1,
        limit: data.pagination?.itemsPerPage || 10,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      });
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    const trimmedSearch = searchInput.trim();
    setSearchQuery(trimmedSearch);
    fetchPayments(1, { status: statusFilter, search: trimmedSearch });
  };

  const handleStatusChange = (value: 'all' | PaymentStatus) => {
    setStatusFilter(value);
    fetchPayments(1, { status: value, search: searchQuery });
  };

  const stats = [
    {
      label: 'Total Payments',
      value: summary.totalPayments,
      icon: CreditCard,
      className: 'stat-card-primary',
      iconClassName: 'text-primary',
    },
    {
      label: 'Completed',
      value: summary.completedPayments,
      icon: CheckCircle2,
      className: 'stat-card-green',
      iconClassName: 'text-success',
    },
    {
      label: 'Pending',
      value: summary.pendingPayments,
      icon: Clock3,
      className: 'stat-card-warning',
      iconClassName: 'text-primaryDark',
    },
    {
      label: 'Failed',
      value: summary.failedPayments,
      icon: AlertCircle,
      className: 'bg-error/10 border border-error/25',
      iconClassName: 'text-error',
    },
    {
      label: 'Revenue',
      value: currencyFormatter.format(summary.completedRevenue || 0),
      icon: Wallet,
      className: 'bg-sky-500/10 border border-sky-500/20',
      iconClassName: 'text-sky-300',
    },
  ];

  return (
    <AdminPageWrapper
      title="Payments"
      subtitle="Monitor subscription transactions, payment health, and gateway outcomes from the backend source of truth."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPayments(pagination.page)}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => (
          <div key={item.label} className={`admin-card p-4 ${item.className}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {isLoading ? '—' : item.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
              </div>
              <div className="p-2 rounded-xl bg-background">
                <item.icon className={`w-5 h-5 ${item.iconClassName}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Transaction Monitor</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Search by customer, profile ID, order ID, transaction ID, or gateway payment ID.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-[260px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applyFilters();
                    }
                  }}
                  placeholder="Search transactions..."
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => handleStatusChange(value as 'all' | PaymentStatus)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={applyFilters} disabled={isLoading}>
                Apply
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden lg:table-cell">Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden xl:table-cell">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        No payments found for the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="align-top">
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">
                              {payment.transactionId || payment.razorpayOrderId || `Payment #${payment.id}`}
                            </div>
                            <div className="text-xs text-muted-foreground break-all">
                              Order: {payment.razorpayOrderId || payment.orderId || 'Not generated'}
                            </div>
                            {payment.razorpayPaymentId && (
                              <div className="text-xs text-muted-foreground break-all">
                                Gateway: {payment.razorpayPaymentId}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="space-y-1">
                            <div className="font-medium">{getCustomerName(payment)}</div>
                            <div className="text-xs text-muted-foreground">
                              {payment.user.profile?.profileId || payment.user.email || payment.user.phone || `User #${payment.userId}`}
                            </div>
                            {(payment.user.profile?.city || payment.user.profile?.state) && (
                              <div className="text-xs text-muted-foreground">
                                {[payment.user.profile?.city, payment.user.profile?.state].filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell align-top">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {payment.subscription?.plan?.name || 'No linked plan'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {payment.subscription?.status || 'No subscription record'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLES[payment.status] || STATUS_STYLES.PENDING}`}>
                            {payment.status}
                          </span>
                          {payment.failureReason && (
                            <p className="mt-2 max-w-[220px] text-xs text-error">
                              {payment.failureReason}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="font-semibold text-foreground">
                            {currencyFormatter.format(toAmount(payment.amount))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payment.paymentMethod || payment.paymentGateway}
                          </div>
                          {payment.refundAmount && toAmount(payment.refundAmount) > 0 && (
                            <div className="text-xs text-sky-300">
                              Refunded: {currencyFormatter.format(toAmount(payment.refundAmount))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell align-top text-muted-foreground">
                          {formatDistanceToNow(new Date(payment.updatedAt), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {payments.length} of {pagination.total} payments
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPayments(pagination.page - 1)}
                    disabled={pagination.page <= 1 || isLoading}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Prev
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPayments(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages || isLoading}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
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
