'use client';

import { useEffect, useState } from 'react';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { type SuccessStory, SuccessStoryStatus } from "@/types/api.types";
import { successStoriesService } from "@/services/successStories.service";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  XCircle, 
  Star, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Quote,
  Loader2,
  RefreshCw,
  Search
} from "lucide-react";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SuccessStoriesPage() {
  const { toast } = useToast();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SuccessStoryStatus | 'ALL'>('ALL');
  const [pagination, setPagination] = useState({ page: 1, total: 0 });
  
  const [viewDialog, setViewDialog] = useState<SuccessStory | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Create form state
  const [formData, setFormData] = useState({
    userId1: '',
    userId2: '',
    partnerName: '',
    title: '',
    story: '',
    weddingDate: '',
    imageUrl: '',
    isFeatured: false
  });

  const fetchStories = async () => {
    setLoading(true);
    try {
      const statusParam = filter === 'ALL' ? undefined : filter as SuccessStoryStatus;
      const data = await successStoriesService.getAll({ 
        page: pagination.page, 
        status: statusParam 
      });
      setStories(data.stories);
      setPagination(prev => ({ ...prev, total: data.pagination.total }));
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to load stories' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [filter, pagination.page]);

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId1 || !formData.title || !formData.story) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'Please fill in required fields' });
        return;
    }
    
    setIsActionLoading(true);
    try {
        await successStoriesService.create({
            ...formData,
            userId1: parseInt(formData.userId1),
            userId2: formData.userId2 ? parseInt(formData.userId2) : undefined
        });
        toast({ title: 'Success', description: 'Success story created manually' });
        setCreateDialogOpen(false);
        setFormData({
            userId1: '', userId2: '', partnerName: '', title: '', 
            story: '', weddingDate: '', imageUrl: '', isFeatured: false
        });
        fetchStories();
    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to create story' });
    } finally {
        setIsActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: SuccessStoryStatus) => {
    setIsActionLoading(true);
    try {
      await successStoriesService.update(id, { status });
      toast({ title: 'Success', description: `Story status updated to ${status}` });
      fetchStories();
      if (viewDialog?.id === id) setViewDialog(null);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to update story' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleFeatured = async (id: number, isFeatured: boolean) => {
    try {
      await successStoriesService.update(id, { isFeatured });
      toast({ title: 'Success', description: isFeatured ? 'Story featured!' : 'Story unfeatured' });
      fetchStories();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to update feature status' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this success story?')) return;
    try {
      await successStoriesService.delete(id);
      toast({ title: 'Deleted', description: 'Story has been removed' });
      fetchStories();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to delete story' });
    }
  };

  const getStatusBadge = (status: SuccessStoryStatus) => {
    switch (status) {
      case 'APPROVED': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
      case 'REJECTED': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'ARCHIVED': return <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">Archived</Badge>;
    }
  };

  return (
    <AdminPageWrapper
      title="Success Stories"
      description="Manage couple testimonials and feature them on the app"
      actions={
        <div className="flex gap-2">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-2" size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Star className="w-4 h-4 fill-current" /> Add Story
            </Button>
            <Button variant="outline" size="sm" onClick={fetchStories} disabled={loading} className="gap-2 rounded-xl">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
            </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Tabs defaultValue="ALL" onValueChange={(v) => setFilter(v as any)} className="w-auto">
            <TabsList className="bg-white/5 border border-white/10 p-1">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading && stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
            <p className="text-zinc-400">Loading success stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Quote className="w-10 h-10 text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-lg">No success stories found in this section</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-outfit">
            {stories.map((story) => (
              <Card key={story.id} className="overflow-hidden bg-white/5 border-white/10 flex flex-col group transition-all hover:border-purple-500/30">
                <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden">
                  {story.imageUrl ? (
                    <Image 
                      src={story.imageUrl} 
                      alt={story.title || 'Success Story'}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                      <Quote size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {getStatusBadge(story.status)}
                    {story.isFeatured && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 gap-1 backdrop-blur-md">
                        <Star className="w-3 h-3 fill-current" /> Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                    {story.title || "Couple Found Love"}
                  </h3>
                  <p className="text-sm text-zinc-400 line-clamp-3 mb-4 flex-1">
                    {story.story}
                  </p>

                  <div className="flex items-center gap-3 mb-5 py-3 border-y border-white/5">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">
                        {story.user1.profile?.firstName} & {story.partnerName || story.user2?.profile?.firstName || "Partner"}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {story.weddingDate ? new Date(story.weddingDate).toLocaleDateString() : 'Date not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => setViewDialog(story)}>
                        <Eye size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 ${story.isFeatured ? 'text-amber-400' : 'text-zinc-400'} hover:text-amber-300`}
                        onClick={() => handleToggleFeatured(story.id, !story.isFeatured)}
                      >
                        <Star size={16} fill={story.isFeatured ? "currentColor" : "none"} />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      {story.status === 'PENDING' && (
                        <>
                          <Button size="sm" variant="outline" className="h-8 text-xs border-green-500/50 text-green-400 hover:bg-green-500/10" onClick={() => handleUpdateStatus(story.id, SuccessStoryStatus.APPROVED)}>
                            <CheckCircle2 size={14} className="mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => handleUpdateStatus(story.id, SuccessStoryStatus.REJECTED)}>
                            <XCircle size={14} className="mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400" onClick={() => handleDelete(story.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Story Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-xl font-outfit">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Success Story</DialogTitle>
            <DialogDescription className="text-zinc-500">Create a manual entry for a couple who found love on the platform.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStory} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">User 1 ID (Primary)</label>
                    <input 
                        type="number" required
                        value={formData.userId1}
                        onChange={(e) => setFormData({...formData, userId1: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500/50"
                        placeholder="e.g. 124"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">User 2 ID (Optional)</label>
                    <input 
                        type="number"
                        value={formData.userId2}
                        onChange={(e) => setFormData({...formData, userId2: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500/50"
                        placeholder="e.g. 125"
                    />
                </div>
            </div>
            {!formData.userId2 && (
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Partner Name (If User 2 is not registered)</label>
                    <input 
                        type="text"
                        value={formData.partnerName}
                        onChange={(e) => setFormData({...formData, partnerName: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500/50"
                        placeholder="e.g. Priya"
                    />
                </div>
            )}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Story Title</label>
                <input 
                    type="text" required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500/50"
                    placeholder="e.g. A match made in Chhattisgarh"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">The Success Story</label>
                <textarea 
                    required minLength={50}
                    value={formData.story}
                    onChange={(e) => setFormData({...formData, story: e.target.value})}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:border-purple-500/50"
                    placeholder="Describe their journey... (min 50 chars)"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Wedding Date</label>
                    <input 
                        type="date"
                        value={formData.weddingDate}
                        onChange={(e) => setFormData({...formData, weddingDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-purple-500/50"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Image URL</label>
                    <input 
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500/50"
                        placeholder="https://..."
                    />
                </div>
            </div>
            <DialogFooter className="pt-4 gap-2">
                <Button variant="outline" type="button" onClick={() => setCreateDialogOpen(false)} className="rounded-xl border-white/10 hover:bg-white/5">Cancel</Button>
                <Button type="submit" disabled={isActionLoading} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                    {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Story"}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewDialog} onOpenChange={() => setViewDialog(null)}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto font-outfit">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{viewDialog?.title || "Success Story"}</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Submitted on {viewDialog && new Date(viewDialog.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {viewDialog && (
            <div className="space-y-6 py-4">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                {viewDialog.imageUrl ? (
                  <Image src={viewDialog.imageUrl} alt="Success" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                    <Quote size={64} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Couple</p>
                  <p className="font-semibold">{viewDialog.user1.profile?.firstName} & {viewDialog.partnerName || viewDialog.user2?.profile?.firstName || "Unknown"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Wedding Date</p>
                  <p className="font-semibold">{viewDialog.weddingDate ? new Date(viewDialog.weddingDate).toLocaleDateString() : 'TBD'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-zinc-400">The Story</p>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 italic text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  "{viewDialog.story}"
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-white">Submitter Contact</p>
                    <p className="text-xs text-zinc-400">Email: {viewDialog.user1.email}</p>
                    <p className="text-xs text-zinc-400">Phone: {viewDialog.user1.phone}</p>
                 </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewDialog(null)} className="rounded-xl border-white/10 hover:bg-white/5">
              Close
            </Button>
            {viewDialog?.status === 'PENDING' && (
              <>
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl" onClick={() => handleUpdateStatus(viewDialog.id, SuccessStoryStatus.APPROVED)} disabled={isActionLoading}>
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve Story"}
                </Button>
                <Button variant="destructive" className="rounded-xl" onClick={() => handleUpdateStatus(viewDialog.id, SuccessStoryStatus.REJECTED)} disabled={isActionLoading}>
                   Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
}
