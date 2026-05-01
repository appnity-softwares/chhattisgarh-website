'use client';

import { useState, useEffect } from 'react';
import { 
  Send, Users, History, RefreshCw, Smartphone, 
  Image as ImageIcon, Zap
} from 'lucide-react';
import { AdminPageWrapper } from '../admin-page-wrapper';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { marketingService, type Broadcast } from '@/services/marketing.service';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
    const [history, setHistory] = useState<Broadcast[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        imageUrl: '',
        target: 'EVERYONE' as 'EVERYONE' | 'PREMIUM' | 'FREE' | 'INACTIVE'
    });

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const data = await marketingService.getHistory();
            setHistory(data);
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast({
                title: 'Error',
                description: err.message || 'Failed to fetch notification history',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.body) {
            toast({
                title: 'Validation Error',
                description: 'Please provide both a title and message body.',
                variant: 'destructive'
            });
            return;
        }

        setIsSending(true);
        try {
            const result = await marketingService.sendBroadcast(formData);
            toast({
                title: 'Success!',
                description: `Notification sent to ${result.sentCount} active devices.`,
                className: 'bg-success/10 border-success/25 text-success'
            });
            // Reset form
            setFormData({
                title: '',
                body: '',
                imageUrl: '',
                target: 'EVERYONE'
            });
            fetchHistory();
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast({
                title: 'Error Sending Notification',
                description: err.message || 'Check your internet or API logs.',
                variant: 'destructive'
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <AdminPageWrapper
            title="Push Notification Center"
            description="Manage and send bulk push notifications to your users for announcements or promotions."
            actions={
                <Button variant="outline" size="sm" onClick={fetchHistory} disabled={isLoading} className="gap-2">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh History
                </Button>
            }
        >
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                {/* Send New Notification Form */}
                <Card className="lg:col-span-5 bg-navy-900/50 border-border overflow-hidden">
                    <CardHeader className="bg-background border-b border-border">
                        <CardTitle className="text-lg flex items-center gap-2">
                           <Zap className="w-5 h-5 text-yellow-400" />
                           Create Broadcast
                        </CardTitle>
                        <CardDescription>Target specific user groups with rich notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSend} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Audience</label>
                                <Select 
                                    value={formData.target} 
                                    onValueChange={(val) => setFormData({ ...formData, target: val as "EVERYONE" | "PREMIUM" | "FREE" | "INACTIVE" })}
                                >
                                    <SelectTrigger className="bg-background border-border text-foreground">
                                        <SelectValue placeholder="Select Audience" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-navy-900 border-border">
                                        <SelectItem value="EVERYONE" className="text-muted-foreground">🎉 Everyone (All Users)</SelectItem>
                                        <SelectItem value="PREMIUM" className="text-muted-foreground">💎 Premium Members Only</SelectItem>
                                        <SelectItem value="FREE" className="text-muted-foreground">🆓 Free Users Only</SelectItem>
                                        <SelectItem value="INACTIVE" className="text-muted-foreground">💤 Inactive Users (30+ days)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notification Title</label>
                                <Input 
                                    placeholder="e.g. Special Weekend Offer! 🎁" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-background border-border text-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message Body</label>
                                <Textarea 
                                    placeholder="Enter your message here..."
                                    rows={4}
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    className="bg-background border-border text-foreground resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                    <span>Rich Image URL (Optional)</span>
                                    <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                </label>
                                <Input 
                                    placeholder="https://example.com/image.jpg"
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="bg-background border-border text-foreground font-mono text-xs"
                                />
                            </div>

                            <div className="pt-4 border-t border-border">
                                <Button 
                                    type="submit" 
                                    disabled={isSending}
                                    className="w-full h-12 bg-primary hover:bg-primaryDark text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                                >
                                    {isSending ? (
                                        <div className="flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Sending Broadcast...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Send className="w-4 h-4" />
                                            Dispatch Push Notification
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* History Listing */}
                <Card className="lg:col-span-7 bg-navy-900/50 border-border overflow-hidden flex flex-col">
                    <CardHeader className="bg-background border-b border-border h-20">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Recent Broadcasts</CardTitle>
                                <CardDescription>View delivery status of past notifications</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-auto max-h-[600px]">
                        {isLoading ? (
                            <div className="p-10 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-16 w-full bg-background rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-center opacity-40">
                                <History className="w-12 h-12 mb-3" />
                                <p className="text-sm">No broadcast history found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.05]">
                                {history.map((item) => (
                                    <div key={item.id} className="p-5 hover:bg-background transition-colors group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    item.status === 'SENT' ? 'bg-success/10 text-success' :
                                                    item.status === 'FAILED' ? 'bg-error/10 text-error' : 
                                                    'bg-primary/10 text-primary'
                                                }`}>
                                                    <Smartphone className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-foreground font-medium text-sm truncate">{item.title}</h4>
                                                    <p className="text-muted-foreground text-xs line-clamp-1 mt-0.5">{item.body}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="flex items-center justify-end gap-1.5 mb-1">
                                                    <Users className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-xs font-semibold text-foreground">{item.sentCount}</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{item.target}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                    item.status === 'SENT' ? 'bg-success/10 text-success border border-success/25' :
                                                    item.status === 'FAILED' ? 'bg-error/10 text-error border border-error/25' : 
                                                    'bg-primary/10 text-primary border border-primary/25'
                                                }`}>
                                                    {item.status}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            
                                            {item.imageUrl && (
                                                <div className="px-2 py-0.5 rounded bg-background border border-border text-[9px] text-muted-foreground font-mono">
                                                    HAS_IMAGE
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminPageWrapper>
    );
}
