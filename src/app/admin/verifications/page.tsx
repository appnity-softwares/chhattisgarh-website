'use client';

import { useEffect, useState } from 'react';
import {
  RefreshCw, CheckCircle, XCircle, RotateCcw, Eye, Clock,
  ShieldCheck, ShieldX, FileImage
} from "lucide-react";
import { verificationsService, PendingVerification, VerificationStats } from "@/services/verifications.service";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import Image from 'next/image';

function StatCard({ label, value, icon: Icon, colorClass, iconColor }: {
  label: string; value: number; icon: React.ElementType; colorClass: string; iconColor: string;
}) {
  return (
    <div className={`admin-card p-5 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>{value}</div>
          <div className="text-xs text-muted-foreground font-medium mt-0.5">{label}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-background">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

export default function AdminVerificationsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [selectedItem, setSelectedItem] = useState<PendingVerification | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'resubmit' | 'view' | null>(null);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [pending, statsResult] = await Promise.all([
          verificationsService.getPendingVerifications(1, 20),
          verificationsService.getStats(),
        ]);
        setVerifications(pending.verifications || []);
        setStats(statsResult);
      } catch (err: unknown) {
        const errorMsg = err as { message?: string };
        toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to load verifications' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleAction = async () => {
    if (!selectedItem || !actionType) return;
    if ((actionType === 'reject' || actionType === 'resubmit') && !reason.trim()) {
      toast({ variant: 'destructive', title: 'Required', description: 'Please provide a reason' });
      return;
    }
    setIsProcessing(true);
    try {
      const mediaId = selectedItem.id.toString();
      if (actionType === 'approve') {
        await verificationsService.approve(mediaId);
        toast({ title: 'Approved ✓', description: 'Verification has been approved' });
      } else if (actionType === 'reject') {
        await verificationsService.reject(mediaId, reason);
        toast({ title: 'Rejected', description: 'Verification has been rejected' });
      } else if (actionType === 'resubmit') {
        await verificationsService.requestResubmission(mediaId, reason);
        toast({ title: 'Resubmission Requested', description: 'User will be notified to resubmit' });
      }
      setSelectedItem(null);
      setActionType(null);
      setReason('');
      window.location.reload();
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const openAction = (item: PendingVerification, type: 'approve' | 'reject' | 'resubmit' | 'view') => {
    setSelectedItem(item);
    setActionType(type);
    setReason('');
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      AADHAAR: 'bg-primary/10 text-primary border-primary/25',
      SELFIE: 'bg-primary/10 text-primary border-primary/25',
      PAN: 'bg-gold/20 text-primaryDark border-gold/35',
    };
    return styles[type] || 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>Profile Verifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review and moderate user identity documents</p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background hover:bg-background text-foreground text-sm font-medium transition-all disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending Review" value={stats?.pending ?? 0} icon={Clock} colorClass="stat-card-warning" iconColor="text-primaryDark" />
        <StatCard label="Approved" value={stats?.approved ?? 0} icon={ShieldCheck} colorClass="stat-card-green" iconColor="text-success" />
        <StatCard label="Rejected" value={stats?.rejected ?? 0} icon={ShieldX} colorClass="stat-card-red" iconColor="text-error" />
        <StatCard label="Total Reviewed" value={stats?.total ?? 0} icon={FileImage} colorClass="stat-card-primary" iconColor="text-primary" />
      </div>

      {/* Pending Queue */}
      <div className="admin-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>Pending Queue</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? '...' : `${verifications.length} items awaiting review`}
            </p>
          </div>
          {verifications.length > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gold/20 text-primaryDark border border-gold/35">
              {verifications.length} pending
            </span>
          )}
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border overflow-hidden">
                  <div className="h-44 skeleton-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="w-28 h-4 skeleton-pulse rounded" />
                    <div className="w-36 h-3 skeleton-pulse rounded" />
                    <div className="flex gap-2 mt-3">
                      {[1, 2, 3, 4].map(j => <div key={j} className="w-8 h-8 skeleton-pulse rounded-lg" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full stat-card-green flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <p className="text-foreground font-semibold mb-1">All Caught Up!</p>
              <p className="text-muted-foreground text-sm">No pending verifications at this time.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {verifications.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-background overflow-hidden hover:border-border transition-colors group">
                  {/* Image Preview */}
                  <div className="relative h-44 bg-background">
                    {item.mediaUrl ? (
                      <Image
                        src={item.mediaUrl}
                        alt="Verification document"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                        <FileImage className="w-8 h-8" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getTypeBadge(item.mediaType)}`}>
                        {item.mediaType}
                      </span>
                    </div>
                  </div>

                  {/* Info & Actions */}
                  <div className="p-3.5 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.user?.profile?.firstName} {item.user?.profile?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{item.user?.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAction(item, 'view')}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-background hover:bg-background text-foreground transition-colors"
                        title="View full size"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openAction(item, 'approve')}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-success/10 hover:bg-success/10 text-success border border-success/25 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openAction(item, 'reject')}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-error/10 hover:bg-error/10 text-error border border-error/25 transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openAction(item, 'resubmit')}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-gold/20 hover:bg-gold/20 text-primaryDark border border-gold/35 transition-colors"
                        title="Request resubmission"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!selectedItem && !!actionType} onOpenChange={() => { setSelectedItem(null); setActionType(null); }}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {actionType === 'view' && <><Eye className="w-5 h-5 text-primary" /> View Document</>}
              {actionType === 'approve' && <><CheckCircle className="w-5 h-5 text-success" /> Approve Verification</>}
              {actionType === 'reject' && <><XCircle className="w-5 h-5 text-error" /> Reject Verification</>}
              {actionType === 'resubmit' && <><RotateCcw className="w-5 h-5 text-primaryDark" /> Request Resubmission</>}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.user?.profile?.firstName} {selectedItem?.user?.profile?.lastName} · {selectedItem?.user?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedItem?.mediaUrl && (
            <div className="relative h-56 bg-background rounded-xl overflow-hidden border border-border">
              <Image
                src={selectedItem.mediaUrl}
                alt="Verification document"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          {(actionType === 'reject' || actionType === 'resubmit') && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {actionType === 'reject' ? 'Rejection Reason' : 'What needs to be fixed?'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={actionType === 'reject' ? 'Explain why this is being rejected...' : 'Describe what needs to be corrected...'}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-foreground bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-primary/25 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
            </div>
          )}

          {actionType === 'approve' && (
            <div className="p-3 rounded-xl bg-success/10 border border-success/25 text-sm text-success">
              ✓ This will mark the user&apos;s document as verified and grant verified status.
            </div>
          )}

          <DialogFooter className="gap-2">
            <button
              onClick={() => { setSelectedItem(null); setActionType(null); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary bg-background hover:bg-background border border-border transition-all"
            >
              Cancel
            </button>
            {actionType !== 'view' && (
              <button
                onClick={handleAction}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-xl text-sm font-semibold text-foreground transition-all disabled:opacity-60
                  ${actionType === 'approve' ? 'bg-success/10 hover:bg-success/10' :
                    actionType === 'reject' ? 'bg-error/10 hover:bg-error/10' :
                    'bg-gold/20 hover:bg-gold/20'}
                `}
              >
                {isProcessing ? 'Processing...' :
                  actionType === 'approve' ? 'Approve' :
                  actionType === 'reject' ? 'Reject' : 'Request Resubmission'}
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
