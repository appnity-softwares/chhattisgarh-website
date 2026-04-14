'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Heart, Star, Eye, Calendar } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import Image from 'next/image';

interface SuccessStory {
    id: number;
    title: string;
    story: string;
    userId1: number;
    userId2?: number;
    partnerName?: string;
    weddingDate?: string;
    imageUrl?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
    isFeatured: boolean;
    createdAt: string;
    user1?: { email: string; profile?: { firstName: string; lastName: string } };
    user2?: { email: string; profile?: { firstName: string; lastName: string } };
}

export default function AdminSuccessStoriesPage() {
    const { toast } = useToast();
    const [stories, setStories] = useState<SuccessStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        story: '',
        partnerName: '',
        weddingDate: '',
        imageUrl: '',
        isFeatured: false,
        status: 'APPROVED' as const
    });

    const fetchStories = async () => {
        try {
            const data = await adminService.getSuccessStories();
            setStories(data || []);
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to fetch stories', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpdateStatus = async (id: number, status: SuccessStory['status']) => {
        try {
            await adminService.updateSuccessStory(id, { status });
            toast({ title: 'Status Updated', description: `Story is now ${status.toLowerCase()}` });
            fetchStories();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    const handleToggleFeatured = async (story: SuccessStory) => {
        try {
            await adminService.updateSuccessStory(story.id, { isFeatured: !story.isFeatured });
            fetchStories();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await adminService.deleteSuccessStory(id);
            toast({ title: 'Deleted', description: 'Success story removed' });
            setDeleteConfirm(null);
            fetchStories();
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    const statusColors = {
        PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        APPROVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
        ARCHIVED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                        Success <span className="text-primary">Stories</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-xs mt-1 uppercase tracking-widest opacity-60">
                        Celebrate and manage unions formed through your platform
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => fetchStories()} variant="outline" size="sm" className="h-10 rounded-xl border-white/10 text-[10px] font-black uppercase tracking-widest">
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-[#0f0f0f] border-white/5 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] -mr-12 -mt-12" />
                    <CardContent className="p-6 relative">
                        <Heart className="w-8 h-8 text-primary mb-3 opacity-40" />
                        <div className="text-2xl font-black text-white">{stories.length}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Total Stories</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#0f0f0f] border-white/5 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[40px] -mr-12 -mt-12" />
                    <CardContent className="p-6 relative">
                        <Star className="w-8 h-8 text-amber-500 mb-3 opacity-40" />
                        <div className="text-2xl font-black text-white">{stories.filter(s => s.isFeatured).length}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Featured</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#0f0f0f] border-white/5 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[40px] -mr-12 -mt-12" />
                    <CardContent className="p-6 relative">
                        <Calendar className="w-8 h-8 text-blue-500 mb-3 opacity-40" />
                        <div className="text-2xl font-black text-white">{stories.filter(s => s.status === 'PENDING').length}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Pending Approval</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-[#0f0f0f] border-white/5 shadow-2xl rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-white/5 p-8">
                    <CardTitle className="text-lg font-black text-white uppercase tracking-tighter">Story Database</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-40">Moderation and management console</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-10 h-10 text-primary animate-spin opacity-40" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Syncing Archives...</p>
                        </div>
                    ) : stories.length === 0 ? (
                        <div className="py-24 text-center">
                            <Heart className="w-16 h-16 mx-auto text-white/5 mb-4" />
                            <p className="text-sm font-black text-white uppercase tracking-widest">No stories found</p>
                            <p className="text-[10px] text-muted-foreground uppercase mt-2">Success stories will appear here once submitted by users</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-white/[0.02]">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-8">Couple</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title & Summary</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Wedding Date</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Featured</TableHead>
                                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground pr-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stories.map((story) => (
                                    <TableRow key={story.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/40 transition-all duration-500">
                                                    {story.imageUrl ? (
                                                        <Image src={story.imageUrl} alt={story.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    ) : (
                                                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                                            <Heart className="w-5 h-5 text-white/10" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-white tracking-tight">
                                                        {story.user1?.profile ? `${story.user1.profile.firstName} & ` : ''}
                                                        {story.partnerName || story.user2?.profile?.firstName || 'Partner'}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase truncate max-w-[150px] opacity-60">
                                                        By {story.user1?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 max-w-[300px]">
                                                <p className="text-xs font-black text-white leading-tight uppercase tracking-tight">{story.title}</p>
                                                <p className="text-[10px] font-medium text-muted-foreground line-clamp-2 leading-relaxed italic opacity-70 italic">{story.story}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                                                <Calendar className="w-3 h-3 text-primary opacity-60" />
                                                {story.weddingDate ? new Date(story.weddingDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`text-[8px] font-black uppercase tracking-widest border-none px-2 h-6 ${statusColors[story.status]}`}>
                                                {story.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Switch 
                                                checked={story.isFeatured} 
                                                onCheckedChange={() => handleToggleFeatured(story)}
                                                className="data-[state=checked]:bg-amber-500"
                                            />
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <div className="flex justify-end gap-2">
                                                {story.status === 'PENDING' && (
                                                    <Button 
                                                        onClick={() => handleUpdateStatus(story.id, 'APPROVED')} 
                                                        size="sm" 
                                                        className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {deleteConfirm === story.id ? (
                                                    <Button onClick={() => handleDelete(story.id)} variant="destructive" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                        Confirm
                                                    </Button>
                                                ) : (
                                                    <Button onClick={() => setDeleteConfirm(story.id)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
