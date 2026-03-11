'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Mail, Phone, MapPin, Calendar, Award, Users, DollarSign, Wallet } from "lucide-react";
import { agentsService } from "@/services/agents.service";
import type { Agent, User } from "@/types/api.types";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AgentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const agentId = params.agentId as string;

    const [agent, setAgent] = useState<Agent | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!agentId) return;
            setIsLoading(true);
            try {
                const [agentData, usersData] = await Promise.all([
                    agentsService.getAgentById(agentId),
                    agentsService.getAgentUsers(agentId)
                ]);
                setAgent(agentData);
                setUsers(usersData.users || []);
            } catch (err: any) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: err.message || 'Failed to load agent details'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [agentId, toast]);

    if (isLoading) {
        return (
            <AdminPageWrapper>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                    <Skeleton className="h-[400px]" />
                </div>
            </AdminPageWrapper>
        );
    }

    if (!agent) {
        return (
            <AdminPageWrapper>
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <h2 className="text-2xl font-bold">Agent Not Found</h2>
                    <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </AdminPageWrapper>
        );
    }

    return (
        <AdminPageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{agent.agentName}</h1>
                            <Badge variant="outline" className="text-primary border-primary">
                                {agent.agentCode}
                            </Badge>
                            <Badge variant={
                                agent.status === 'ACTIVE' ? 'default' :
                                    agent.status === 'SUSPENDED' ? 'destructive' : 'secondary'
                            }>
                                {agent.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3" />
                            {agent.city}, {agent.district}, {agent.state}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {/* Action buttons could go here */}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{agent.totalUsersAdded}</div>
                            <p className="text-xs text-muted-foreground">Referred users</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Users className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{agent.activeUsers}</div>
                            <p className="text-xs text-muted-foreground">Currently active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Premium Conversions</CardTitle>
                            <Award className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{agent.premiumUsers}</div>
                            <p className="text-xs text-muted-foreground">Paid subscriptions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Contact</CardTitle>
                            <Phone className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">{agent.contactPerson}</div>
                            <div className="text-xs text-muted-foreground mt-1">{agent.phone}</div>
                            <div className="text-xs text-muted-foreground">{agent.email}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users List */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Referred Users</CardTitle>
                        <CardDescription>List of users registered via {agent.agentCode}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Registered</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No users found for this agent.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>{user.profile?.firstName?.[0] || 'U'}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">
                                                            {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'No Profile'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {/* Requires Subscription Data if available in user object */}
                                                <span className="text-sm text-muted-foreground">-</span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {format(new Date(user.createdAt), 'PPp')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminPageWrapper>
    );
}
