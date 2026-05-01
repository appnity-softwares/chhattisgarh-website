"use client";

import React from 'react';
import { AdminPageWrapper } from '../admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useSystemDiagnostics } from '@/hooks/use-diagnostics';
import { 
    Database, 
    Server, 
    HardDrive, 
    MessageSquare, 
    CreditCard, 
    Activity, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCcw,
    Cpu,
    MemoryStick
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DiagnosticsPage() {
    const { data, isLoading, isError: _isError, refetch, isRefetching, flushCache } = useSystemDiagnostics();

    const getStatusBadge = (status: string) => {
        if (status?.includes('✅') || status?.includes('Connected') || status?.includes('Initialized')) {
            return <Badge className="bg-success/10 text-success border-success/25">Operational</Badge>;
        }
        if (status?.includes('⚠️')) {
            return <Badge className="bg-gold/20 text-primaryDark border-gold/35">Warning</Badge>;
        }
        return <Badge className="bg-error/10 text-error border-error/25">Error</Badge>;
    };

    const getStatusIcon = (status: string) => {
        if (status?.includes('✅') || status?.includes('Connected') || status?.includes('Initialized')) {
            return <CheckCircle2 className="w-5 h-5 text-success" />;
        }
        return <AlertCircle className="w-5 h-5 text-error" />;
    };

    return (
        <AdminPageWrapper 
            title="System Diagnostics" 
            subtitle="Real-time health monitoring of platform infrastructure and external services."
            actions={
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()} 
                    disabled={isRefetching || isLoading}
                    className="bg-background border-border hover:bg-background"
                >
                    <RefreshCcw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                    Refresh Status
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Database Card */}
                <Card className="bg-card/30 border-border overflow-hidden group hover:border-primary/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Database className="w-4 h-4 text-primary" />
                            Database
                        </CardTitle>
                        {data && getStatusIcon(data.database.status)}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <h3 className="text-2xl font-bold text-foreground">{data?.database.latency || '---'}</h3>
                                {data && getStatusBadge(data.database.status)}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                PostgreSQL Latency
                            </p>
                            {data?.database.error && (
                                <p className="text-[10px] text-error bg-error/10 p-2 rounded-lg font-medium">
                                    {data.database.error}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Redis Card */}
                <Card className="bg-card/30 border-border overflow-hidden group hover:border-primary/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4 text-error" />
                            Cache Engine
                        </CardTitle>
                        {data && getStatusIcon(data.redis.status)}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <h3 className="text-xl font-bold text-foreground">Redis Cluster</h3>
                                {data && getStatusBadge(data.redis.status)}
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                    Real-time Pub/Sub Status
                                </p>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => (window.confirm("Flush entire Redis cache? No data will be lost, but performance may temporarily dip.") && flushCache.mutate())}
                                    disabled={flushCache.isPending}
                                    className="h-6 px-2 text-[8px] font-bold uppercase text-error hover:text-error hover:bg-error/10 border border-error/25 rounded-md"
                                >
                                    {flushCache.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCcw className="w-3 h-3 mr-1" />}
                                    Flush Cache
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Storage Card */}
                <Card className="bg-card/30 border-border overflow-hidden group hover:border-primary/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-primaryDark" />
                            File Storage
                        </CardTitle>
                        {data && getStatusIcon(data.storage.status)}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <h3 className="text-xl font-bold text-foreground">Cloudflare R2</h3>
                                {data && getStatusBadge(data.storage.status)}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                Object Storage Connectivity
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Firebase Card */}
                <Card className="bg-card/30 border-border overflow-hidden group hover:border-primary/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-primaryDark" />
                            Notification Hub
                        </CardTitle>
                        {data && getStatusIcon(data.firebase.status)}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <h3 className="text-xl font-bold text-foreground">Firebase Admin</h3>
                                {data && getStatusBadge(data.firebase.status)}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                Project: {data?.firebase.projectName || 'Default'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Gateway Card */}
                <Card className="bg-card/30 border-border overflow-hidden group hover:border-primary/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" />
                            Payment Gateway
                        </CardTitle>
                        {data && getStatusIcon(data.razorpay.status)}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <h3 className="text-xl font-bold text-foreground">Razorpay API</h3>
                                {data && getStatusBadge(data.razorpay.status)}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                Transaction Engine Status
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* System Stats Card */}
                <Card className="bg-card/30 border-border overflow-hidden group hover:border-primary/20 transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Server className="w-4 h-4 text-success" />
                            Server Host
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Cpu className="w-3 h-3" />
                                    Uptime
                                </div>
                                <p className="text-sm font-bold text-foreground">{data?.system.uptime || '---'}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MemoryStick className="w-3 h-3" />
                                    Memory
                                </div>
                                <p className="text-sm font-bold text-foreground">{data?.system.memoryUsage || '---'}</p>
                            </div>
                            <div className="col-span-2 pt-2 border-t border-border">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                    Node {data?.system.nodeVersion} on {data?.system.platform}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Config & Environment Check */}
            <Card className="bg-card/30 border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-bold uppercase tracking-tight flex items-center gap-3">
                        Environment Variable Audit
                        {data && (
                            <Badge className={data.env.status.includes('Success') ? "bg-success/10 text-success" : "bg-gold/20 text-primaryDark"}>
                                {data.env.status}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data?.env.details ? (
                        <div className="space-y-6">
                            <div className="flex gap-8">
                                <div className="text-center p-4 bg-background rounded-2xl min-w-[120px]">
                                    <p className="text-3xl font-bold text-foreground">{data.env.details.totalRequired}</p>
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Required</p>
                                </div>
                                <div className="text-center p-4 bg-background rounded-2xl min-w-[120px]">
                                    <p className="text-3xl font-bold text-success">{data.env.details.configured}</p>
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Configured</p>
                                </div>
                                <div className="text-center p-4 bg-background rounded-2xl min-w-[120px]">
                                    <p className={`text-3xl font-bold ${data.env.details.missing.length > 0 ? 'text-error' : 'text-success'}`}>
                                        {data.env.details.missing.length}
                                    </p>
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Missing</p>
                                </div>
                            </div>
                            
                            {data.env.details.missing.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-error uppercase tracking-widest">Action Required: Missing Variables</p>
                                    <div className="flex flex-wrap gap-2">
                                        {data.env.details.missing.map((v: string) => (
                                            <Badge key={v} variant="outline" className="border-error/25 text-error bg-error/10 px-3 py-1 font-mono text-[10px]">
                                                {v}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center p-12 text-muted-foreground font-medium text-sm">
                            Running audit...
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminPageWrapper>
    );
}
