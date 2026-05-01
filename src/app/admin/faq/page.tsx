'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, HelpCircle } from 'lucide-react';
import { adminService } from '@/services/admin.service';

// Types
interface FAQ {
    id: number;
    key: string;
    question: string;
    questionHi: string;
    answer: string;
    answerHi: string;
    faqCategory: string;
    order: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

const FAQ_CATEGORIES = [
    'General',
    'Account & Profile',
    'Privacy & Security',
    'Matches & Interests',
    'Premium & Payments',
    'Chhattisgarh Specific',
];

const CATEGORY_COLORS: Record<string, string> = {
    'General': 'bg-orange-100 text-orange-800',
    'Account & Profile': 'bg-blue-100 text-blue-800',
    'Privacy & Security': 'bg-green-100 text-green-800',
    'Matches & Interests': 'bg-pink-100 text-pink-800',
    'Premium & Payments': 'bg-amber-100 text-amber-800',
    'Chhattisgarh Specific': 'bg-indigo-100 text-indigo-800',
};

const emptyFaq = {
    question: '',
    questionHi: '',
    answer: '',
    answerHi: '',
    faqCategory: 'General',
    order: 0,
    isActive: true,
};

export default function AdminFAQPage() {
    const { toast } = useToast();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
    const [formData, setFormData] = useState(emptyFaq);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const fetchFAQs = async () => {
        try {
            const data = await adminService.getFaqsAdmin();
            setFaqs(data || []);
        } catch (err: unknown) {
            toast({ title: 'Error', description: err.message || 'Failed to fetch FAQs', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFAQs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreate = async () => {
        if (!formData.question || !formData.answer) {
            toast({ title: 'Error', description: 'Question and answer are required', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            await adminService.createFaq(formData);
            toast({ title: 'Success', description: 'FAQ created successfully' });
            setDialogOpen(false);
            setFormData(emptyFaq);
            fetchFAQs();
        } catch (err: unknown) {
            toast({ title: 'Error', description: err.message || 'Failed to create FAQ', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingFaq) return;
        setSaving(true);
        try {
            await adminService.updateFaq(editingFaq.id, formData);
            toast({ title: 'Success', description: 'FAQ updated successfully' });
            setDialogOpen(false);
            setEditingFaq(null);
            setFormData(emptyFaq);
            fetchFAQs();
        } catch (err: unknown) {
            toast({ title: 'Error', description: err.message || 'Failed to update FAQ', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await adminService.deleteFaq(id);
            toast({ title: 'Success', description: 'FAQ deleted' });
            setDeleteConfirm(null);
            fetchFAQs();
        } catch (err: unknown) {
            toast({ title: 'Error', description: err.message || 'Failed to delete FAQ', variant: 'destructive' });
        }
    };

    const handleToggleActive = async (faq: FAQ) => {
        try {
            await adminService.updateFaq(faq.id, { isActive: !faq.isActive });
            fetchFAQs();
        } catch (err: unknown) {
            toast({ title: 'Error', description: err.message || 'Failed to toggle status', variant: 'destructive' });
        }
    };

    const openEditDialog = (faq: FAQ) => {
        setEditingFaq(faq);
        setFormData({
            question: faq.question,
            questionHi: faq.questionHi,
            answer: faq.answer,
            answerHi: faq.answerHi,
            faqCategory: faq.faqCategory,
            order: faq.order,
            isActive: faq.isActive,
        });
        setDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingFaq(null);
        setFormData({ ...emptyFaq, order: faqs.length + 1 });
        setDialogOpen(true);
    };

    // Group for stats
    const categoryStats = FAQ_CATEGORIES.map(cat => ({
        name: cat,
        count: faqs.filter(f => f.faqCategory === cat).length,
        active: faqs.filter(f => f.faqCategory === cat && f.isActive).length,
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">FAQ Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage frequently asked questions shown on the website and app
                    </p>
                </div>
                <Button onClick={openCreateDialog} size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    Add FAQ
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {categoryStats.map(stat => (
                    <Card key={stat.name} className="p-3">
                        <div className="text-xs font-medium text-muted-foreground truncate">{stat.name}</div>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold">{stat.count}</span>
                            <span className="text-xs text-muted-foreground">({stat.active} active)</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* FAQ Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" />
                        All FAQs ({faqs.length})
                    </CardTitle>
                    <CardDescription>
                        Click edit to modify, toggle switch to show/hide, or delete to remove.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : faqs.length === 0 ? (
                        <div className="text-center py-12">
                            <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
                            <p className="text-muted-foreground text-lg">No FAQs yet</p>
                            <p className="text-muted-foreground text-sm mt-1">Click &quot;Add FAQ&quot; to create your first question</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Question</TableHead>
                                    <TableHead className="w-44">Category</TableHead>
                                    <TableHead className="w-20 text-center">Active</TableHead>
                                    <TableHead className="w-32 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {faqs.map((faq, index) => (
                                    <TableRow key={faq.id} className={!faq.isActive ? 'opacity-50' : ''}>
                                        <TableCell className="font-mono text-muted-foreground">
                                            {String(index + 1).padStart(2, '0')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm leading-tight">{faq.question}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">{faq.answer}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${CATEGORY_COLORS[faq.faqCategory] || 'bg-gray-100 text-gray-800'} text-xs`} variant="outline">
                                                {faq.faqCategory}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={faq.isActive}
                                                onCheckedChange={() => handleToggleActive(faq)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(faq)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                {deleteConfirm === faq.id ? (
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(faq.id)}>
                                                        Confirm
                                                    </Button>
                                                ) : (
                                                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(faq.id)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
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

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open: boolean) => {
                setDialogOpen(open);
                if (!open) { setEditingFaq(null); setFormData(emptyFaq); }
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
                        <DialogDescription>
                            {editingFaq ? 'Update the FAQ question and answer' : 'Create a new FAQ entry'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Category & Order */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={formData.faqCategory} onValueChange={(v: string) => setFormData(p => ({ ...p, faqCategory: v }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FAQ_CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Display Order</Label>
                                <Input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>

                        {/* Question (English) */}
                        <div className="space-y-2">
                            <Label>Question (English / Hindi)</Label>
                            <Input
                                placeholder="Enter the question..."
                                value={formData.question}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(p => ({ ...p, question: e.target.value }))}
                            />
                        </div>

                        {/* Question (Hindi) */}
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Question (Hindi — optional)</Label>
                            <Input
                                placeholder="हिंदी में प्रश्न लिखें..."
                                value={formData.questionHi}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(p => ({ ...p, questionHi: e.target.value }))}
                            />
                        </div>

                        {/* Answer (English) */}
                        <div className="space-y-2">
                            <Label>Answer (English / Hindi)</Label>
                            <Textarea
                                placeholder="Enter the answer..."
                                value={formData.answer}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(p => ({ ...p, answer: e.target.value }))}
                                rows={5}
                            />
                        </div>

                        {/* Answer (Hindi) */}
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Answer (Hindi — optional)</Label>
                            <Textarea
                                placeholder="हिंदी में उत्तर लिखें..."
                                value={formData.answerHi}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(p => ({ ...p, answerHi: e.target.value }))}
                                rows={4}
                            />
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={(v: boolean) => setFormData(p => ({ ...p, isActive: v }))}
                            />
                            <Label>Published (visible to users)</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={editingFaq ? handleUpdate : handleCreate} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingFaq ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
