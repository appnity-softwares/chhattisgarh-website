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
  User,
  Quote,
  Loader2,
  RefreshCw
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

  useEffect(() => {
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
      } catch (err: unknown) {
        const errorMsg = err as { message?: string };
        toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to load stories' });
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // We'll rely on the useEffect to refetch or we can manually trigger it if we keep it outside.
        // Actually I moved fetchStories inside useEffect. I'll just reload the page or use a state trigger.
        window.location.reload(); 
    } catch (err: unknown) {
        const errorMsg = err as { message?: string };
        toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to create story' });
    } finally {
        setIsActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: SuccessStoryStatus) => {
    setIsActionLoading(true);
    try {
      await successStoriesService.update(id, { status });
      toast({ title: 'Success', description: `Story status updated to ${status}` });
      window.location.reload();
      if (viewDialog?.id === id) setViewDialog(null);
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to update story' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleFeatured = async (id: number, isFeatured: boolean) => {
    try {
      await successStoriesService.update(id, { isFeatured });
      toast({ title: 'Success', description: isFeatured ? 'Story featured!' : 'Story unfeatured' });
      window.location.reload();
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to update feature status' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this success story?')) return;
    try {
      await successStoriesService.delete(id);
      toast({ title: 'Deleted', description: 'Story has been removed' });
      window.location.reload();
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      toast({ variant: 'destructive', title: 'Error', description: errorMsg.message || 'Failed to delete story' });
    }
  };

  const getStatusBadge = (status: SuccessStoryStatus) => {
    switch (status) {
      case 'APPROVED': return <Badge className="bg-success/10 text-success border-success/25">Approved</Badge>;
      case 'REJECTED': return <Badge className="bg-error/10 text-error border-error/25">Rejected</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'ARCHIVED': return <Badge className="bg-muted text-muted-foreground border-border">Archived</Badge>;
    }
  };

  return (
    <AdminPageWrapper
      title="Success Stories"
      description="Manage couple testimonials and feature them on the app"
      actions={
        <div className="flex gap-2">
            <Button className="bg-primary/10 hover:bg-primary/10 text-foreground rounded-xl gap-2" size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Star className="w-4 h-4 fill-current" /> Add Story
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} disabled={loading} className="gap-2 rounded-xl">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
            </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Tabs defaultValue="ALL" onValueChange={(v) => setFilter(v as SuccessStoryStatus | 'ALL')} className="w-auto">
            <TabsList className="bg-background border border-border p-1">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading && stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-background rounded-3xl border border-dashed border-border">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading success stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-background rounded-3xl border border-dashed border-border">
            <Quote className="w-10 h-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No success stories found in this section</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-outfit">
            {stories.map((story) => (
              <Card key={story.id} className="overflow-hidden bg-background border-border flex flex-col group transition-all hover:border-primary/25">
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {story.imageUrl ? (
                    <Image 
                      src={story.imageUrl} 
                      alt={story.title || 'Success Story'}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Quote size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {getStatusBadge(story.status)}
                    {story.isFeatured && (
                      <Badge className="bg-primary/10 text-primary border-primary/25 gap-1 backdrop-blur-md">
                        <Star className="w-3 h-3 fill-current" /> Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1">
                    {story.title || "Couple Found Love"}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {story.story}
                  </p>

                  <div className="flex items-center gap-3 mb-5 py-3 border-y border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {story.user1.profile?.firstName} & {story.partnerName || story.user2?.profile?.firstName || "Partner"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {story.weddingDate ? new Date(story.weddingDate).toLocaleDateString() : 'Date not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setViewDialog(story)}>
                        <Eye size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 ${story.isFeatured ? 'text-primaryDark' : 'text-muted-foreground'} hover:text-primaryDark`}
                        onClick={() => handleToggleFeatured(story.id, !story.isFeatured)}
                      >
                        <Star size={16} fill={story.isFeatured ? "currentColor" : "none"} />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      {story.status === 'PENDING' && (
                        <>
                          <Button size="sm" variant="outline" className="h-8 text-xs border-success/25 text-success hover:bg-success/10" onClick={() => handleUpdateStatus(story.id, SuccessStoryStatus.APPROVED)}>
                            <CheckCircle2 size={14} className="mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs border-error/25 text-error hover:bg-error/10" onClick={() => handleUpdateStatus(story.id, SuccessStoryStatus.REJECTED)}>
                            <XCircle size={14} className="mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-error" onClick={() => handleDelete(story.id)}>
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
        <DialogContent className="bg-muted border-border text-foreground max-w-xl font-outfit">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Success Story</DialogTitle>
            <DialogDescription className="text-muted-foreground">Create a manual entry for a couple who found love on the platform.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStory} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">User 1 ID (Primary)</label>
                    <input 
                        type="number" required
                        value={formData.userId1}
                        onChange={(e) => setFormData({...formData, userId1: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/25"
                        placeholder="e.g. 124"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">User 2 ID (Optional)</label>
                    <input 
                        type="number"
                        value={formData.userId2}
                        onChange={(e) => setFormData({...formData, userId2: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/25"
                        placeholder="e.g. 125"
                    />
                </div>
            </div>
            {!formData.userId2 && (
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Partner Name (If User 2 is not registered)</label>
                    <input 
                        type="text"
                        value={formData.partnerName}
                        onChange={(e) => setFormData({...formData, partnerName: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/25"
                        placeholder="e.g. Priya"
                    />
                </div>
            )}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Story Title</label>
                <input 
                    type="text" required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/25"
                    placeholder="e.g. A match made in Chhattisgarh"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">The Success Story</label>
                <textarea 
                    required minLength={50}
                    value={formData.story}
                    onChange={(e) => setFormData({...formData, story: e.target.value})}
                    rows={4}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:border-primary/25"
                    placeholder="Describe their journey... (min 50 chars)"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Wedding Date</label>
                    <input 
                        type="date"
                        value={formData.weddingDate}
                        onChange={(e) => setFormData({...formData, weddingDate: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/25"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Image URL</label>
                    <input 
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/25"
                        placeholder="https://..."
                    />
                </div>
            </div>
            <DialogFooter className="pt-4 gap-2">
                <Button variant="outline" type="button" onClick={() => setCreateDialogOpen(false)} className="rounded-xl border-border hover:bg-background">Cancel</Button>
                <Button type="submit" disabled={isActionLoading} className="bg-primary/10 hover:bg-primary/10 text-foreground rounded-xl">
                    {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Story"}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewDialog} onOpenChange={() => setViewDialog(null)}>
        <DialogContent className="bg-muted border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto font-outfit">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{viewDialog?.title || "Success Story"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Submitted on {viewDialog && new Date(viewDialog.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {viewDialog && (
            <div className="space-y-6 py-4">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted border border-border">
                {viewDialog.imageUrl ? (
                  <Image src={viewDialog.imageUrl} alt="Success" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Quote size={64} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-background border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Couple</p>
                  <p className="font-semibold">{viewDialog.user1.profile?.firstName} & {viewDialog.partnerName || viewDialog.user2?.profile?.firstName || "Unknown"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-background border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Wedding Date</p>
                  <p className="font-semibold">{viewDialog.weddingDate ? new Date(viewDialog.weddingDate).toLocaleDateString() : 'TBD'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">The Story</p>
                <div className="p-5 rounded-2xl bg-background border border-border font-medium text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  &ldquo;{viewDialog.story}&rdquo;
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-primary/10 border border-primary/25">
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Submitter Contact</p>
                    <p className="text-xs text-muted-foreground">Email: {viewDialog.user1.email}</p>
                    <p className="text-xs text-muted-foreground">Phone: {viewDialog.user1.phone}</p>
                 </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewDialog(null)} className="rounded-xl border-border hover:bg-background">
              Close
            </Button>
            {viewDialog?.status === 'PENDING' && (
              <>
                <Button className="bg-success/10 hover:bg-success/10 text-foreground rounded-xl" onClick={() => handleUpdateStatus(viewDialog.id, SuccessStoryStatus.APPROVED)} disabled={isActionLoading}>
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
