"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, ArrowLeft, CheckCircle2, XCircle, Clock, Eye, Loader2, Send, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePhotoRequests } from "@/hooks/use-photo-requests";
import { useRouter } from "next/navigation";export default function PhotoRequestsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("received");
    const { received, sent, isLoading, pendingCount, accept, reject } = usePhotoRequests();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary" className="bg-gold/20 text-primaryDark border-gold/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'APPROVED':
                return <Badge variant="secondary" className="bg-success/10 text-success border-success/25"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'REJECTED':
                return <Badge variant="secondary" className="bg-error/10 text-error border-error/25"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 hover:bg-background">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-tighter text-foreground">Photo Requests</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                            Manage your photo sharing
                        </p>
                    </div>
                </div>
                {pendingCount > 0 && (
                    <Badge className="bg-primary text-white px-4 py-2 rounded-full text-xs font-bold">
                        {pendingCount} Pending
                    </Badge>
                )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-background rounded-2xl p-1">
                    <TabsTrigger value="received" className="rounded-xl font-bold uppercase text-xs tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Inbox className="w-4 h-4 mr-2" />
                        Received
                        {pendingCount > 0 && (
                            <span className="ml-2 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                                {pendingCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="rounded-xl font-bold uppercase text-xs tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Send className="w-4 h-4 mr-2" />
                        Sent
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="received" className="mt-6 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : received.length === 0 ? (
                        <Card className="bg-surface border-border rounded-[2rem] p-12">
                            <div className="flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center">
                                    <Camera className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold uppercase tracking-tight">No Requests</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        You haven&apos;t received any photo requests yet.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        received.map((request) => (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="bg-surface border-border rounded-[2rem] overflow-hidden hover:border-primary/20 transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-5">
                                            <Avatar className="h-16 w-16 border-2 border-border cursor-pointer"
                                                onClick={() => router.push(`/dashboard/profile/${request.requester?.id}`)}>
                                                <AvatarImage src={request.requester?.profile?.media?.[0]?.url} className="object-cover" />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {request.requester?.profile?.firstName?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-lg tracking-tight">
                                                            {request.requester?.profile?.firstName} {request.requester?.profile?.lastName}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Requested access to your photo
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Eye className="w-4 h-4 text-primary" />
                                                        {getStatusBadge(request.status)}
                                                    </div>
                                                </div>

                                                {request.message && (
                                                    <div className="mt-3 p-4 bg-background rounded-xl">
                                                        <p className="text-sm font-medium text-muted-foreground">
                                                            &ldquo;{request.message}&rdquo;
                                                        </p>
                                                    </div>
                                                )}

                                                {request.status === 'PENDING' && (
                                                    <div className="flex gap-3 mt-5">
                                                        <Button
                                                            onClick={() => accept.mutate(request.id)}
                                                            disabled={accept.isPending}
                                                            className="flex-1 h-12 bg-success/10 hover:bg-success/10 text-foreground font-bold uppercase tracking-widest text-xs rounded-xl"
                                                        >
                                                            {accept.isPending ? (
                                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                            ) : (
                                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                            )}
                                                            Allow Access
                                                        </Button>
                                                        <Button
                                                            onClick={() => reject.mutate(request.id)}
                                                            disabled={reject.isPending}
                                                            variant="outline"
                                                            className="flex-1 h-12 border-error/25 text-error hover:bg-error/10 font-bold uppercase tracking-widest text-xs rounded-xl"
                                                        >
                                                            {reject.isPending ? (
                                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 mr-2" />
                                                            )}
                                                            Decline
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="sent" className="mt-6 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : sent.length === 0 ? (
                        <Card className="bg-surface border-border rounded-[2rem] p-12">
                            <div className="flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center">
                                    <Camera className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold uppercase tracking-tight">No Sent Requests</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        You haven&apos;t sent any photo requests yet.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">
                                Photo requests you send will appear here
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
