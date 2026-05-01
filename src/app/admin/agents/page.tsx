'use client';

import { useEffect, useState } from 'react';
import { Search, RefreshCw, Plus, ChevronLeft, ChevronRight, Trash2, AlertTriangle, MapPin, Users, Briefcase, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { agentsService } from "@/services/agents.service";
import type { Agent, AgentStatus } from "@/types/api.types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STATUS_STYLES: Record<AgentStatus, string> = {
  ACTIVE: 'bg-success/10 text-success border-success/25',
  INACTIVE: 'bg-muted text-muted-foreground border-border',
  SUSPENDED: 'bg-gold/20 text-primaryDark border-gold/35',
  TERMINATED: 'bg-error/10 text-error border-error/25',
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
  agentName: '', contactPerson: '', phone: '',
  email: '', city: '', district: '', state: 'Chhattisgarh',
};

function FormField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl text-sm text-foreground bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-primary/25 focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 ${props.className || ''}`}
    />
  );
}

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
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to load agents' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchAgents(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateAgent = async () => {
    if (!formData.agentName) {
      toast({ variant: 'destructive', title: 'Error', description: 'Agent name is required' });
      return;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      toast({ variant: 'destructive', title: 'Invalid Phone', description: 'Enter a valid 10-digit mobile number starting with 6-9' });
      return;
    }
    setIsSaving(true);
    try {
      await agentsService.createAgent(formData);
      toast({ title: 'Agent Created', description: 'New agent has been added successfully' });
      setShowCreateDialog(false);
      setFormData(initialFormData);
      fetchAgents();
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to create agent' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    try {
      await agentsService.deleteAgent(agentToDelete.id.toString());
      toast({ title: 'Agent Deleted', description: 'Agent has been removed' });
      setAgentToDelete(null);
      fetchAgents(pagination.page);
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to delete agent' });
    }
  };

  const handleStatusChange = async (agentId: number, status: AgentStatus) => {
    try {
      await agentsService.updateAgent(agentId.toString(), { status });
      toast({ title: 'Status Updated', description: `Agent is now ${status.toLowerCase()}` });
      fetchAgents(pagination.page);
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to update status' });
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.agentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>Agent Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? 'Loading...' : `${pagination.total} registered agents`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchAgents(pagination.page)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background hover:bg-background text-foreground text-sm font-medium transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-foreground text-sm font-semibold btn-primary-gradient"
          >
            <Plus className="w-4 h-4" />
            Add Agent
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="admin-card overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              placeholder="Search by name, code, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-foreground bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-primary/25 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Agent</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Performance</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 skeleton-pulse rounded-full" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-3.5 skeleton-pulse rounded" />
                          <div className="w-40 h-3 skeleton-pulse rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><div className="w-16 h-5 skeleton-pulse rounded-full" /></td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><div className="w-24 h-3.5 skeleton-pulse rounded" /></td>
                    <td className="px-4 py-3.5 hidden lg:table-cell"><div className="w-10 h-3.5 skeleton-pulse rounded" /></td>
                    <td className="px-4 py-3.5"><div className="w-16 h-5 skeleton-pulse rounded-full" /></td>
                    <td className="px-4 py-3.5"><div className="w-8 h-8 skeleton-pulse rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No agents found</p>
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="text-primary text-xs mt-2 hover:underline">Clear search</button>}
                  </td>
                </tr>
              ) : (
                filteredAgents.map(agent => (
                  <tr key={agent.id} className="border-b border-border hover:bg-background transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary border border-primary/25 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {agent.agentName?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{agent.agentName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {agent.contactPerson ? agent.contactPerson : agent.email || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono font-semibold px-2 py-1 rounded-lg bg-background text-muted-foreground border border-border">
                        {agent.agentCode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {agent.city || agent.district || 'N/A'}{agent.district && agent.city ? `, ${agent.district}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-primary" />
                          <span className="text-xs text-foreground font-medium">{agent.totalUsersAdded ?? 0}</span>
                          <span className="text-xs text-muted-foreground">total</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[agent.status] || STATUS_STYLES.INACTIVE}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-primary transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border w-44">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Change Status</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-background" />
                          <DropdownMenuItem onClick={() => handleStatusChange(agent.id, 'ACTIVE' as AgentStatus)} className="text-success focus:text-success focus:bg-success/10 cursor-pointer">Set Active</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(agent.id, 'SUSPENDED' as AgentStatus)} className="text-primaryDark focus:text-primaryDark focus:bg-gold/20 cursor-pointer">Suspend</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(agent.id, 'TERMINATED' as AgentStatus)} className="text-error focus:text-error focus:bg-error/10 cursor-pointer">Terminate</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-background" />
                          <DropdownMenuItem onClick={() => setAgentToDelete(agent)} className="text-error focus:text-error focus:bg-error/10 gap-2 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
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
            Showing {agents.length} of {pagination.total} agents
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => fetchAgents(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-background text-foreground text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              onClick={() => fetchAgents(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-background text-foreground text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Agent Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Plus className="w-4 h-4 text-foreground" />
              </div>
              Add New Agent
            </DialogTitle>
            <DialogDescription>Create a new agent profile to track referrals and commissions.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FormField label="Agent Name *" id="agentName">
              <StyledInput
                id="agentName"
                value={formData.agentName}
                onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                placeholder="e.g. Rahul Enterprises"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Contact Person" id="contactPerson">
                <StyledInput
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Full name"
                />
              </FormField>
              <FormField label="Phone *" id="phone">
                <StyledInput
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9XXXXXXXXX"
                  maxLength={10}
                />
              </FormField>
            </div>
            <FormField label="Email" id="email">
              <StyledInput
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="agent@example.com"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="City" id="city">
                <StyledInput
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Raipur"
                />
              </FormField>
              <FormField label="District" id="district">
                <StyledInput
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Raipur"
                />
              </FormField>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowCreateDialog(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary bg-background hover:bg-background border border-border transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAgent}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-foreground btn-primary-gradient disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Creating...' : 'Create Agent'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!agentToDelete} onOpenChange={() => setAgentToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-error" /> Delete Agent?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong className="text-foreground">{agentToDelete?.agentName}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background border-border text-foreground hover:bg-background">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAgent} className="bg-error/10 hover:bg-error/10 text-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
