'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, Trash2, 
  RefreshCw, CheckCircle, Clock, 
  MoreVertical, Reply, Eye, 
  MessageSquare, User as UserIcon, Calendar,
  Phone, Info
} from 'lucide-react';
import { AdminPageWrapper } from '../admin-page-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { contactService } from '@/services/contact.service';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ContactMessageStatus } from '@/types/api.types';
import type { ContactMessage } from '@/types/api.types';

export default function MessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const { toast } = useToast();

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            // Reusing getMessages
            const status = filterStatus === 'ALL' ? undefined : filterStatus as ContactMessageStatus;
            const result = await contactService.getMessages(1, 100, status);
            // Result is actually mapping to 'data' in our controller response
            setMessages(Array.isArray(result) ? result : (result as { data?: ContactMessage[] }).data || []);
        } catch (error: unknown) {
            const errorMsg = error as { message?: string };
            toast({
                title: 'Error',
                description: errorMsg.message || 'Failed to fetch contact messages',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus]);

    const handleUpdateStatus = async (id: number, status: ContactMessageStatus) => {
        try {
            await contactService.updateStatus(id.toString(), status);
            toast({
                title: 'Status Updated',
                description: `Message marked as ${status.toLowerCase()}`,
                className: 'bg-success/10 border-success/25 text-success'
            });
            fetchMessages();
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, status });
            }
        } catch (error: unknown) {
            const errorMsg = error as { message?: string };
            toast({
                title: 'Error',
                description: errorMsg.message || 'Failed to update status',
                variant: 'destructive'
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await contactService.deleteMessage(id.toString());
            toast({
                title: 'Message Deleted',
                description: 'Support request removed permanently.'
            });
            fetchMessages();
            if (selectedMessage?.id === id) setSelectedMessage(null);
        } catch (error: unknown) {
            const errorMsg = error as { message?: string };
            toast({
                title: 'Error',
                description: errorMsg.message || 'Failed to delete message',
                variant: 'destructive'
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-primary/10 text-primary border-primary/25';
            case 'READ': return 'bg-muted text-muted-foreground border-border';
            case 'REPLIED': return 'bg-success/10 text-success border-success/25';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <AdminPageWrapper
            title="Customer Support Requests"
            description="Manage incoming inquiries and support requests from users and visitors."
            actions={
                <Button variant="outline" size="sm" onClick={fetchMessages} disabled={isLoading} className="gap-2">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            }
        >
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] min-h-[500px]">
                {/* Master List */}
                <Card className="lg:w-1/3 bg-navy-900/50 border-border flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border bg-background">
                        <div className="flex items-center gap-2 mb-3">
                            <Input 
                                placeholder="Search messages..."
                                className="bg-background border-border text-foreground placeholder:text-muted-foreground h-9"
                            />
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[110px] bg-background border-border text-foreground h-9">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-navy-900 border-border">
                                    <SelectItem value="ALL">All</SelectItem>
                                    <SelectItem value="PENDING">New</SelectItem>
                                    <SelectItem value="READ">Read</SelectItem>
                                    <SelectItem value="REPLIED">Replied</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-white/[0.05]">
                        {isLoading ? (
                            <div className="p-8 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-16 w-full bg-background rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="p-12 text-center opacity-40">
                                <Mail className="w-10 h-10 mx-auto mb-3" />
                                <p className="text-sm">No messages found</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`p-4 cursor-pointer transition-all hover:bg-background relative border-l-2 ${
                                        selectedMessage?.id === msg.id ? 'bg-background border-primary/25' : 
                                        msg.status === 'PENDING' ? 'border-primary/25' : 'border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-foreground font-semibold text-sm truncate max-w-[150px]">{msg.name}</h4>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${msg.status === 'PENDING' ? 'text-muted-foreground font-medium' : 'text-muted-foreground'}`}>
                                        {msg.subject || 'Support Request'}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${getStatusColor(msg.status)}`}>
                                            {msg.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Detail View */}
                <Card className="lg:w-2/3 bg-navy-900/50 border-border flex flex-col overflow-hidden">
                    {selectedMessage ? (
                        <div className="h-full flex flex-col">
                            <div className="p-6 border-b border-border bg-background flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center">
                                       <UserIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground uppercase tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                            {selectedMessage.name}
                                        </h2>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            <Mail className="w-3 h-3" /> {selectedMessage.email}
                                            {selectedMessage.phone && (
                                                <>
                                                  <span className="opacity-30">|</span>
                                                  <Phone className="w-3 h-3" /> {selectedMessage.phone}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className="h-9 w-9 bg-background border-border">
                                                <MoreVertical className="w-4 h-4 text-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-navy-900 border-border">
                                            <DropdownMenuItem onClick={() => handleUpdateStatus(selectedMessage.id, ContactMessageStatus.REPLIED)} className="text-success">
                                                <CheckCircle className="w-4 h-4 mr-2" /> Mark as Replied
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleUpdateStatus(selectedMessage.id, ContactMessageStatus.READ)} className="text-primary">
                                                <Eye className="w-4 h-4 mr-2" /> Mark as Read
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-background" />
                                            <DropdownMenuItem onClick={() => handleDelete(selectedMessage.id)} className="text-error">
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete Message
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="flex-1 p-8 overflow-y-auto space-y-8">
                                <section className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <MessageSquare className="w-3 h-3" /> Subject
                                    </div>
                                    <div className="bg-background border border-border rounded-xl p-4 text-foreground font-medium">
                                        {selectedMessage.subject || 'Inquiry regarding services'}
                                    </div>
                                </section>

                                <section className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <Reply className="w-3 h-3" /> Message Content
                                    </div>
                                    <div className="bg-background border border-border rounded-2xl p-6 text-muted-foreground leading-relaxed font-light text-base font-medium shadow-inner">
                                        &ldquo;{selectedMessage.message}&rdquo;
                                    </div>
                                </section>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="p-4 rounded-xl bg-background border border-border flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Received</p>
                                            <p className="text-xs text-muted-foreground">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-background border border-border flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Last Status</p>
                                            <p className={`text-xs font-semibold ${
                                                selectedMessage.status === 'PENDING' ? 'text-primary' :
                                                selectedMessage.status === 'REPLIED' ? 'text-success' : 'text-muted-foreground'
                                            }`}>
                                                {selectedMessage.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-border bg-background flex items-center justify-between">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Info className="w-3 h-3" /> 
                                    Click the action menu to update status after responding via email or phone.
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Matrimony Support'}`)}
                                      className="border-primary/25 text-primary hover:bg-primary/10 hover:border-primary/25"
                                    >
                                        <Mail className="w-4 h-4 mr-2" /> Email Reply
                                    </Button>
                                    <Button 
                                      className="bg-primary/10 hover:bg-primary/10 text-foreground"
                                      onClick={() => handleUpdateStatus(selectedMessage.id, ContactMessageStatus.REPLIED)}
                                    >
                                        Mark as Handled
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-30">
                            <div className="w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-6">
                                <Mail className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-medium text-foreground mb-2">Select a Message</h3>
                            <p className="text-sm max-w-[300px]">
                                Click on a support request from the list to view its contents and take action.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </AdminPageWrapper>
    );
}
