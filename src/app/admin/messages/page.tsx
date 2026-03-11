'use client';

import { useEffect, useState } from 'react';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
    MoreHorizontal,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    MessageSquare,
    Trash2,
    CheckCircle,
    Clock
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { contactService } from "@/services/contact.service";
import { ContactMessage, ContactMessageStatus } from "@/types/api.types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<ContactMessageStatus, 'default' | 'secondary' | 'outline'> = {
    PENDING: 'secondary',
    READ: 'outline',
    REPLIED: 'default',
};

export default function AdminMessagesPage() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | 'ALL'>('ALL');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const fetchMessages = async (page = 1) => {
        setIsLoading(true);
        try {
            const result = await contactService.getMessages(
                page,
                10,
                statusFilter === 'ALL' ? undefined : statusFilter
            );
            // Result is expected to be ContactMessage[] from fetchWithAuth, but our service might return {messages, pagination}
            // Based on contactService.ts: result = await this.fetchWithAuth<ContactMessage[]>(url);
            // But my backend returns { success, data, pagination }
            // Let's assume the data is in result if fetchWithAuth returns data.
            // If result is an array, then it's messages.
            if (Array.isArray(result)) {
                setMessages(result);
                setPagination({ page, limit: 10, total: result.length, totalPages: 1 });
            } else {
                // If result is { messages, pagination } or something else
                const res = result as any;
                setMessages(res.messages || res.data || []);
                setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
            }
        } catch (err: any) {
            console.error('Failed to fetch messages:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to load messages',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [statusFilter]);

    const handleStatusChange = async (messageId: number, newStatus: ContactMessageStatus) => {
        try {
            await contactService.updateStatus(messageId.toString(), newStatus);
            toast({
                title: 'Success',
                description: 'Message status updated successfully',
            });
            fetchMessages(pagination.page);
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to update message',
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await contactService.deleteMessage(id.toString());
            toast({
                title: 'Deleted',
                description: 'Message deleted successfully',
            });
            fetchMessages(pagination.page);
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to delete message',
            });
        }
    };

    const openViewDialog = (message: ContactMessage) => {
        setSelectedMessage(message);
        setIsViewOpen(true);
        if (message.status === 'PENDING') {
            handleStatusChange(message.id, 'READ' as ContactMessageStatus);
        }
    };

    return (
        <AdminPageWrapper>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
                        <p className="text-muted-foreground">
                            View and manage messages from the website contact form.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchMessages(pagination.page)} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex gap-4">
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContactMessageStatus | 'ALL')}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Messages</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="READ">Read</SelectItem>
                                    <SelectItem value="REPLIED">Replied</SelectItem>
                                </SelectContent>
                            </Select>
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
                                            <TableHead>Sender</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="hidden md:table-cell">Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {messages.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                    No messages found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            messages.map(msg => (
                                                <TableRow key={msg.id}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{msg.name}</span>
                                                            <span className="text-xs text-muted-foreground">{msg.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="truncate max-w-[200px] block">
                                                            {msg.subject || 'No Subject'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={statusColors[msg.status]}>
                                                            {msg.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => openViewDialog(msg)}>
                                                                <MessageSquare className="h-4 w-4" />
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Manage</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(msg.id, 'REPLIED' as ContactMessageStatus)}>
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        Mark Replied
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(msg.id, 'PENDING' as ContactMessageStatus)}>
                                                                        <Clock className="mr-2 h-4 w-4" />
                                                                        Mark Pending
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(msg.id)}>
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {messages.length} of {pagination.total} messages
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchMessages(pagination.page - 1)}
                                            disabled={pagination.page <= 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Prev
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchMessages(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.totalPages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* View Message Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Message Details</DialogTitle>
                        <DialogDescription>
                            Received {selectedMessage && formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true })}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedMessage && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">From</span>
                                    <p className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-primary" />
                                        {selectedMessage.name} ({selectedMessage.email})
                                    </p>
                                </div>
                                {selectedMessage.phone && (
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground">Phone</span>
                                        <p className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-primary" />
                                            {selectedMessage.phone}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Subject</span>
                                <p className="font-medium text-lg">{selectedMessage.subject || 'No Subject'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Message</span>
                                <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                        <Button onClick={() => {
                            if (selectedMessage) {
                                window.location.href = `mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject}`;
                                handleStatusChange(selectedMessage.id, 'REPLIED' as ContactMessageStatus);
                                setIsViewOpen(false);
                            }
                        }}>
                            Reply via Email
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminPageWrapper>
    );
}
