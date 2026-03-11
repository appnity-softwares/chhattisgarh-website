'use client';

import { useEffect, useState } from 'react';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Search, RefreshCw, Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { agentsService } from "@/services/agents.service";
import type { Agent, AgentStatus } from "@/types/api.types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusColors: Record<AgentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    ACTIVE: 'default',
    INACTIVE: 'secondary',
    SUSPENDED: 'destructive',
    TERMINATED: 'destructive',
};

interface AgentFormData {
    agentName: string;
    contactPerson: string;
    phone: string;
    email: string;
    city: string;
    district: string;
    state: string;
}

const initialFormData: AgentFormData = {
    agentName: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
    district: '',
    state: 'Chhattisgarh',
};

export default function AdminAgentsPage() {
    const { toast } = useToast();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [formData, setFormData] = useState<AgentFormData>(initialFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

    const fetchAgents = async (page = 1) => {
        setIsLoading(true);
        try {
            const data = await agentsService.getAgents(page, 10);
            setAgents(data.agents || []);
            setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
        } catch (err: any) {
            console.error('Failed to fetch agents:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to load agents',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleCreateAgent = async () => {
        if (!formData.agentName) {
            toast({ variant: 'destructive', title: 'Error', description: 'Agent name is required' });
            return;
        }

        // Phone Validation
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone)) {
            toast({
                variant: 'destructive',
                title: 'Invalid Phone',
                description: 'Please enter a valid 10-digit mobile number starting with 6-9'
            });
            return;
        }

        setIsSaving(true);
        try {
            await agentsService.createAgent(formData);
            toast({ title: 'Success', description: 'Agent created successfully' });
            setShowCreateDialog(false);
            setFormData(initialFormData);
            fetchAgents();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to create agent' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAgent = async () => {
        if (!agentToDelete) return;
        try {
            await agentsService.deleteAgent(agentToDelete.id.toString());
            toast({ title: 'Success', description: 'Agent deleted successfully' });
            setAgentToDelete(null);
            fetchAgents(pagination.page);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to delete agent' });
        }
    };

    const handleStatusChange = async (agentId: number, status: AgentStatus) => {
        try {
            await agentsService.updateAgent(agentId.toString(), { status });
            toast({ title: 'Success', description: 'Agent status updated' });
            fetchAgents(pagination.page);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to update status' });
        }
    };

    const filteredAgents = agents.filter(agent =>
        agent.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.agentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminPageWrapper>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <CardTitle>Agent Management</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => fetchAgents(pagination.page)} disabled={isLoading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Agent
                            </Button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search agents by name, code, or email..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                                        <TableHead>Agent</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead className="hidden md:table-cell">Location</TableHead>
                                        <TableHead className="hidden lg:table-cell">Users</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAgents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                No agents found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAgents.map(agent => (
                                            <TableRow key={agent.id}>
                                                <TableCell>
                                                    <div className="font-medium">{agent.agentName}</div>
                                                    <div className="text-sm text-muted-foreground">{agent.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{agent.agentCode}</Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground">
                                                    {agent.city || agent.district || '-'}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    <div className="text-sm">
                                                        <span className="font-medium">{agent.totalUsersAdded}</span> total
                                                        <span className="text-muted-foreground ml-2">
                                                            ({agent.premiumUsers} premium)
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={statusColors[agent.status]}>
                                                        {agent.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleStatusChange(agent.id, 'ACTIVE' as AgentStatus)}>
                                                                Set Active
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(agent.id, 'SUSPENDED' as AgentStatus)}>
                                                                Suspend
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => setAgentToDelete(agent)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
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
                                    Showing {agents.length} of {pagination.total} agents
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchAgents(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Prev
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchAgents(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages}
                                    >
                                        Next <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Create Agent Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Agent</DialogTitle>
                        <DialogDescription>Create a new agent to track referrals.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="agentName">Agent Name *</Label>
                            <Input
                                id="agentName"
                                value={formData.agentName}
                                onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                                placeholder="Enter agent name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson">Contact Person</Label>
                                <Input
                                    id="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="district">District</Label>
                                <Input
                                    id="district"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateAgent} disabled={isSaving}>
                            {isSaving ? 'Creating...' : 'Create Agent'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!agentToDelete} onOpenChange={() => setAgentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {agentToDelete?.agentName}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAgent} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminPageWrapper>
    );
}
