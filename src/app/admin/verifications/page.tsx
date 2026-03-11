'use client';

import { useEffect, useState } from 'react';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CheckCircle, XCircle, RotateCcw, Eye, Clock, CheckCheck, X } from "lucide-react";
import { verificationsService, PendingVerification, VerificationStats } from "@/services/verifications.service";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from 'next/image';

export default function AdminVerificationsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [verifications, setVerifications] = useState<PendingVerification[]>([]);
    const [stats, setStats] = useState<VerificationStats | null>(null);
    const [selectedItem, setSelectedItem] = useState<PendingVerification | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'resubmit' | 'view' | null>(null);
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pendingResult, statsResult] = await Promise.all([
                verificationsService.getPendingVerifications(1, 20),
                verificationsService.getStats(),
            ]);
            setVerifications(pendingResult.verifications || []);
            setStats(statsResult);
        } catch (err: any) {
            console.error('Failed to fetch verifications:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to load verifications',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async () => {
        if (!selectedItem || !actionType) return;
        if ((actionType === 'reject' || actionType === 'resubmit') && !reason.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide a reason' });
            return;
        }

        setIsProcessing(true);
        try {
            const mediaId = selectedItem.id.toString();
            if (actionType === 'approve') {
                await verificationsService.approve(mediaId);
                toast({ title: 'Success', description: 'Verification approved' });
            } else if (actionType === 'reject') {
                await verificationsService.reject(mediaId, reason);
                toast({ title: 'Success', description: 'Verification rejected' });
            } else if (actionType === 'resubmit') {
                await verificationsService.requestResubmission(mediaId, reason);
                toast({ title: 'Success', description: 'Resubmission requested' });
            }
            setSelectedItem(null);
            setActionType(null);
            setReason('');
            fetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const openAction = (item: PendingVerification, type: 'approve' | 'reject' | 'resubmit' | 'view') => {
        setSelectedItem(item);
        setActionType(type);
        setReason('');
    };

    return (
        <AdminPageWrapper>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Profile Verifications</h1>
                        <p className="text-muted-foreground">Review and approve user photos and documents</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCheck className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.approved || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <X className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.rejected || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Queue */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Verifications</CardTitle>
                        <CardDescription>Items waiting for approval</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-24 w-full" />
                                ))}
                            </div>
                        ) : verifications.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                <p>All caught up! No pending verifications.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {verifications.map((item) => (
                                    <Card key={item.id} className="overflow-hidden">
                                        <div className="relative h-48 bg-muted">
                                            {item.mediaUrl ? (
                                                <Image
                                                    src={item.mediaUrl}
                                                    alt="Verification media"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                                    No image
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4 space-y-3">
                                            <div>
                                                <p className="font-medium">
                                                    {item.user?.profile?.firstName} {item.user?.profile?.lastName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{item.user?.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{item.mediaType}</Badge>
                                                <Badge variant="secondary">{item.status}</Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => openAction(item, 'view')}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => openAction(item, 'approve')}>
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => openAction(item, 'reject')}>
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => openAction(item, 'resubmit')}>
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Action Dialog */}
            <Dialog open={!!selectedItem && !!actionType} onOpenChange={() => { setSelectedItem(null); setActionType(null); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'view' && 'View Details'}
                            {actionType === 'approve' && 'Approve Verification'}
                            {actionType === 'reject' && 'Reject Verification'}
                            {actionType === 'resubmit' && 'Request Resubmission'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedItem?.user?.profile?.firstName} {selectedItem?.user?.profile?.lastName}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedItem?.mediaUrl && (
                        <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                            <Image
                                src={selectedItem.mediaUrl}
                                alt="Verification media"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    )}

                    {(actionType === 'reject' || actionType === 'resubmit') && (
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder={actionType === 'reject' ? 'Why is this being rejected?' : 'What needs to be fixed?'}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setSelectedItem(null); setActionType(null); }}>
                            Cancel
                        </Button>
                        {actionType !== 'view' && (
                            <Button
                                onClick={handleAction}
                                disabled={isProcessing}
                                className={actionType === 'approve' ? 'bg-green-500 hover:bg-green-600' : actionType === 'reject' ? '' : ''}
                                variant={actionType === 'reject' ? 'destructive' : 'default'}
                            >
                                {isProcessing ? 'Processing...' : actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Request Resubmission'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminPageWrapper>
    );
}
