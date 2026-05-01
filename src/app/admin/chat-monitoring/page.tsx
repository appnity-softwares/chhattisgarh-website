'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Search, RefreshCw, ChevronLeft, ChevronRight, Filter, X, Users, MessageCircle, Flag, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminPageWrapper } from '@/app/admin/admin-page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin.service';
import { PaginationData } from '@/types/api.types';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Conversation {
  id: number;
  participant1?: {
    id: number;
    email: string;
    role: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  participant2?: {
    id: number;
    email: string;
    role: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  messageCount: number;
  lastMessage: string;
  lastMessageTime: string;
  isFlagged: boolean;
  updatedAt: string;
}

interface Message {
  id: number;
  text: string;
  type: 'TEXT' | 'IMAGE';
  sender?: {
    id: number;
    email: string;
    role: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  isFlagged?: boolean;
  flagReason?: string;
}

export default function AdminChatMonitoringPage() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isDeleting, _setIsDeleting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    conversationId?: number;
    reason: string;
  }>({ isOpen: false, conversationId: 0, reason: '' });

  const fetchConversations = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllConversations(page, 10, searchQuery, flaggedOnly ? 'true' : undefined);
      setConversations((data.conversations as Conversation[]) || []);
      setPagination((data.pagination as PaginationData) || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load conversations';
      toast({ variant: 'destructive', title: 'Error', description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }, [flaggedOnly, searchQuery, toast]);

  const fetchConversation = async (conversationId: number) => {
    setIsLoading(true);
    try {
      const response = await adminService.getConversationById(conversationId.toString()) as { messages?: Message[] };
      setSelectedConversation(response as unknown as Conversation);
      setMessages(response.messages || []);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load conversation';
      toast({ variant: 'destructive', title: 'Error', description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await adminService.deleteConversation(conversationId.toString());
      toast({ title: 'Success', description: 'Conversation deleted successfully' });
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to delete conversation' });
    }
  };

  const handleFlagMessage = async (messageId: number, reason: string) => {
    try {
      await adminService.flagMessage(messageId, reason);
      toast({ title: 'Success', description: 'Message flagged successfully' });
      // Refresh messages to show updated flag status
      if (selectedConversation) {
        fetchConversation(selectedConversation.id);
      }
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to flag message' });
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <AdminPageWrapper
      title="Chat Moderation"
      description="Monitor and moderate user conversations"
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Search Conversations</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="flagged-only"
                    checked={flaggedOnly}
                    onCheckedChange={(checked) => setFlaggedOnly(checked === true)}
                  />
                  <label htmlFor="flagged-only" className="text-sm font-medium">
                    Flagged Only
                  </label>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fetchConversations()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle>Conversations ({pagination.total})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No conversations found</h3>
                  <p className="text-muted-foreground mt-2">
                    {flaggedOnly ? 'No flagged conversations found' : 'No conversations match your current filters'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => fetchConversation(conversation.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex -space-x-2">
                            {conversation.participant1?.profile && (
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">
                                    {conversation.participant1.profile.firstName} {conversation.participant1.profile.lastName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {conversation.participant1.email}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="text-muted-foreground">↔</div>
                            {conversation.participant2?.profile && (
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                  <Users className="w-4 h-4 text-secondary" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">
                                    {conversation.participant2.profile.firstName} {conversation.participant2.profile.lastName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {conversation.participant2.email}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-muted-foreground">
                            {conversation.messageCount} messages
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last: {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {conversation.isFlagged && (
                            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25">
                              <Flag className="w-3 h-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => setDeleteDialog({ isOpen: true, conversationId: conversation.id, reason: '' })}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Conversation
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {conversation.participant1 && (
                                <DropdownMenuItem
                                  onClick={() => handleFlagMessage(conversation.participant1!.id, 'Flagged for review')}
                                  className="text-amber-600"
                                >
                                  <Flag className="w-4 h-4 mr-2" />
                                  Flag User 1
                                </DropdownMenuItem>
                              )}
                              {conversation.participant2 && (
                                <DropdownMenuItem
                                  onClick={() => handleFlagMessage(conversation.participant2!.id, 'Flagged for review')}
                                  className="text-amber-600"
                                >
                                  <Flag className="w-4 h-4 mr-2" />
                                  Flag User 2
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground truncate" title={conversation.lastMessage}>
                        {conversation.lastMessage}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchConversations(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchConversations(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Messages */}
          {selectedConversation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {selectedConversation.participant1?.profile && (
                        <>
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {selectedConversation.participant1.profile.firstName} {selectedConversation.participant1.profile.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedConversation.participant1.email}
                            </div>
                          </div>
                        </>
                      )}
                      <div className="text-muted-foreground">↔</div>
                      {selectedConversation.participant2?.profile && (
                        <>
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-secondary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {selectedConversation.participant2.profile.firstName} {selectedConversation.participant2.profile.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedConversation.participant2.email}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-primary/10 text-primary border-primary/25">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Active Chat
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <X className="w-4 h-4" />
                      Close
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((message, _index) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender?.id === selectedConversation.participant1?.id
                          ? 'justify-start'
                          : 'justify-end'
                      } mb-4`}
                    >
                      <div className="flex items-start space-x-3 max-w-xs">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="bg-muted rounded-lg p-3 max-w-md">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </div>
                            {message.isFlagged && (
                              <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25">
                                <Flag className="w-3 h-3 mr-1" />
                                Flagged
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm">{message.text}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleFlagMessage(message.id, 'Flagged for moderation')}
                              className="text-amber-600"
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              Flag Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, isOpen: open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this conversation? This action cannot be undone and will permanently remove all messages between the participants.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteDialog.conversationId) {
                    handleDeleteConversation(deleteDialog.conversationId);
                  }
                  setDeleteDialog({ isOpen: false, conversationId: 0, reason: '' });
                }}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Conversation
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminPageWrapper>
  );
}
