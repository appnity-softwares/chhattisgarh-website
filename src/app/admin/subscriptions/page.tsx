'use client';

import { useEffect, useState } from 'react';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Percent, Edit, Check, X, Plus, Trash2 } from "lucide-react";
import { subscriptionsService } from "@/services/subscriptions.service";
import type { SubscriptionPlan } from "@/types/api.types";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSubscriptionsPage() {
    const { toast } = useToast();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Discount Dialog
    const [discountDialog, setDiscountDialog] = useState<SubscriptionPlan | null>(null);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [discountValidUntil, setDiscountValidUntil] = useState('');

    // Edit Plan Dialog
    const [editPlanDialog, setEditPlanDialog] = useState<SubscriptionPlan | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        price: 0,
        durationDays: 30,
        features: [] as string[],
        isActive: true,
    });
    const [newFeature, setNewFeature] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    // Helper to parse features (could be JSON string or array)
    const parseFeatures = (features: any): string[] => {
        if (!features) return [];
        if (Array.isArray(features)) return features;
        if (typeof features === 'string') {
            try {
                const parsed = JSON.parse(features);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    };

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const data = await subscriptionsService.getPlans();
            setPlans(data || []);
        } catch (err: any) {
            console.error('Failed to fetch plans:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to load subscription plans',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    // Discount Dialog
    const openDiscountDialog = (plan: SubscriptionPlan) => {
        setDiscountDialog(plan);
        setDiscountPercentage(plan.discountPercentage || 0);
        setDiscountValidUntil(plan.discountValidUntil ? new Date(plan.discountValidUntil).toISOString().split('T')[0] : '');
    };

    const handleSaveDiscount = async () => {
        if (!discountDialog) return;
        setIsSaving(true);
        try {
            await subscriptionsService.updatePlanDiscount(
                discountDialog.id.toString(),
                discountPercentage,
                discountValidUntil || undefined
            );
            toast({
                title: 'Success',
                description: 'Discount updated successfully',
            });
            setDiscountDialog(null);
            fetchPlans();
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to update discount',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Edit Plan Dialog
    const openEditPlanDialog = (plan: SubscriptionPlan) => {
        setEditPlanDialog(plan);
        setEditForm({
            name: plan.name,
            description: plan.description || '',
            price: plan.originalPrice || plan.price,
            durationDays: plan.durationDays,
            features: parseFeatures(plan.features),
            isActive: plan.isActive,
        });
    };

    const handleAddFeature = () => {
        if (newFeature.trim()) {
            setEditForm(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()],
            }));
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (index: number) => {
        setEditForm(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index),
        }));
    };

    const handleSavePlan = async () => {
        if (!editPlanDialog) return;
        setIsSaving(true);
        try {
            await subscriptionsService.updatePlan(editPlanDialog.id.toString(), editForm);
            toast({
                title: 'Success',
                description: 'Plan updated successfully',
            });
            setEditPlanDialog(null);
            fetchPlans();
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to update plan',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminPageWrapper>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Subscription Plans</h1>
                        <p className="text-muted-foreground">Manage subscription plans, pricing, and discounts</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchPlans} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-80 w-full rounded-lg" />
                        ))}
                    </div>
                ) : plans.length === 0 ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">No subscription plans found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {plans.map(plan => (
                            <Card key={plan.id} className={`relative ${plan.hasActiveDiscount ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                                {plan.hasActiveDiscount && (
                                    <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                        {plan.discountPercentage}% OFF
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                                        <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                                            {plan.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-baseline gap-2">
                                            {plan.hasActiveDiscount && plan.originalPrice && (
                                                <span className="text-lg text-muted-foreground line-through">
                                                    ₹{plan.originalPrice}
                                                </span>
                                            )}
                                            <span className="text-4xl font-bold text-primary">
                                                ₹{plan.effectivePrice || plan.price}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            for {plan.durationDays} days
                                        </p>
                                    </div>

                                    <div className="space-y-2 min-h-[100px]">
                                        <p className="text-sm font-medium">Features:</p>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            {parseFeatures(plan.features).map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => openEditPlanDialog(plan)}
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Plan
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => openDiscountDialog(plan)}
                                        >
                                            <Percent className="mr-2 h-4 w-4" />
                                            Discount
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Plan Dialog */}
            <Dialog open={!!editPlanDialog} onOpenChange={() => setEditPlanDialog(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Plan - {editPlanDialog?.name}</DialogTitle>
                        <DialogDescription>
                            Modify plan details, pricing, and features.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="details" className="mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="features">Features</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Plan Name</Label>
                                <Input
                                    id="name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (₹)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        value={editForm.price}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (days)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        min="1"
                                        value={editForm.durationDays}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, durationDays: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <Label htmlFor="active">Plan Active</Label>
                                    <p className="text-sm text-muted-foreground">Users can purchase this plan</p>
                                </div>
                                <Switch
                                    id="active"
                                    checked={editForm.isActive}
                                    onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="features" className="space-y-4 mt-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a feature..."
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                />
                                <Button onClick={handleAddFeature} size="icon" variant="outline">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {editForm.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                                        <span className="flex-1 text-sm">{feature}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleRemoveFeature(i)}
                                        >
                                            <X className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                ))}
                                {editForm.features.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No features added yet
                                    </p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setEditPlanDialog(null)}>Cancel</Button>
                        <Button onClick={handleSavePlan} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Discount Dialog */}
            <Dialog open={!!discountDialog} onOpenChange={() => setDiscountDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Discount - {discountDialog?.name}</DialogTitle>
                        <DialogDescription>
                            Set a discount percentage and optional expiry date.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="discount">Discount Percentage</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discountPercentage}
                                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                                />
                                <span className="text-muted-foreground">%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiry">Discount Valid Until (Optional)</Label>
                            <Input
                                id="expiry"
                                type="date"
                                value={discountValidUntil}
                                onChange={(e) => setDiscountValidUntil(e.target.value)}
                            />
                        </div>
                        {discountPercentage > 0 && discountDialog && (
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm">
                                    <span className="font-medium">New Price: </span>
                                    <span className="text-xl font-bold text-primary">
                                        ₹{Math.round((discountDialog.originalPrice || discountDialog.price) * (1 - discountPercentage / 100))}
                                    </span>
                                    <span className="text-muted-foreground ml-2 line-through">
                                        ₹{discountDialog.originalPrice || discountDialog.price}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDiscountDialog(null)}>Cancel</Button>
                        <Button onClick={handleSaveDiscount} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Discount'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminPageWrapper>
    );
}
