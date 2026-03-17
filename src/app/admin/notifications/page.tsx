'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { marketingService, PushNotification } from '@/services/marketing.service';
import { Loader2, Send, History, Users, Target, Image as ImageIcon, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function NotificationCenter() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<PushNotification[]>([]);
    
    const [form, setForm] = useState({
        title: '',
        body: '',
        imageUrl: '',
        target: 'ALL'
    });

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const data = await marketingService.getNotificationHistory();
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!form.title || !form.body) {
            toast({ title: 'Error', description: 'Title and body are required', variant: 'destructive' });
            return;
        }

        try {
            setSending(true);
            await marketingService.sendNotification(form);
            toast({ title: 'Success', description: 'Notification sent successfully to queue.' });
            setForm({ title: '', body: '', imageUrl: '', target: 'ALL' });
            loadHistory();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to send notification', variant: 'destructive' });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Push Notification Center</h1>
                <p className="text-muted-foreground">Broadcast messages to your app users in real-time.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Send Notification */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" />
                            Broadcast Message
                        </CardTitle>
                        <CardDescription>Send a "Megaphone" alert to specific user segments.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Heading / Title</Label>
                            <Input 
                                placeholder="E.g. Happy Holi! Special Offer 🎨" 
                                value={form.title}
                                onChange={(e) => setForm({...form, title: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Message Body</Label>
                            <Textarea 
                                placeholder="Details about your announcement..." 
                                rows={4}
                                value={form.body}
                                onChange={(e) => setForm({...form, body: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Target Segment</Label>
                            <Select value={form.target} onValueChange={(val) => setForm({...form, target: val})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select target" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Users (Broadast)</SelectItem>
                                    <SelectItem value="FREE">Free Users Only</SelectItem>
                                    <SelectItem value="PREMIUM">Premium Users Only</SelectItem>
                                    <SelectItem value="PARTIAL_PROFILES">Incomplete Profiles</SelectItem>
                                    <SelectItem value="RAIPUR">Users in Raipur</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Rich Image URL (Optional)</Label>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="https://example.com/banner.jpg" 
                                    value={form.imageUrl}
                                    onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                                />
                                <div className="p-2 border rounded bg-slate-50">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                        <Button className="w-full" onClick={handleSend} disabled={sending}>
                            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
                            Send Now
                        </Button>
                    </CardFooter>
                </Card>

                {/* History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>History of last sent broadcasts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item) => (
                                    <div key={item.id} className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-sm">{item.title}</h4>
                                            <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{item.body}</p>
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Target className="w-3 h-3" />
                                                {item.target}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                Reached {item.reach}
                                            </div>
                                            <span>{format(new Date(item.sentAt), 'MMM d, h:mm a')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
