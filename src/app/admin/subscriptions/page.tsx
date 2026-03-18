'use client';

import { useEffect, useState } from 'react';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Percent, Edit, Check, X, Plus, Crown, DollarSign, Clock } from "lucide-react";
import { subscriptionsService } from "@/services/subscriptions.service";
import { type SubscriptionPlan, UserRole } from "@/types/api.types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50 ${props.className || ''}`}
    />
  );
}

function StyledTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50 resize-none ${props.className || ''}`}
    />
  );
}

function FieldLabel({ label, id }: { label: string; id: string }) {
  return (
    <label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {label}
    </label>
  );
}

export default function AdminSubscriptionsPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [discountDialog, setDiscountDialog] = useState<SubscriptionPlan | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountValidUntil, setDiscountValidUntil] = useState('');

  const [editPlanDialog, setEditPlanDialog] = useState<SubscriptionPlan | null>(null);
  const [editForm, setEditForm] = useState({
    name: '', description: '', price: 0, durationDays: 30, features: [] as string[], isActive: true, roleToAssign: UserRole.PREMIUM_USER,
  });
  const [newFeature, setNewFeature] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const parseFeatures = (features: any): string[] => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try { const p = JSON.parse(features); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    return [];
  };

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const data = await subscriptionsService.getPlans();
      setPlans(data || []);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to load plans' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openDiscountDialog = (plan: SubscriptionPlan) => {
    setDiscountDialog(plan);
    setDiscountPercentage(plan.discountPercentage || 0);
    setDiscountValidUntil(plan.discountValidUntil ? new Date(plan.discountValidUntil).toISOString().split('T')[0] : '');
  };

  const handleSaveDiscount = async () => {
    if (!discountDialog) return;
    setIsSaving(true);
    try {
      await subscriptionsService.updatePlanDiscount(discountDialog.id.toString(), discountPercentage, discountValidUntil || undefined);
      toast({ title: 'Discount Updated', description: 'Plan discount has been saved' });
      setDiscountDialog(null);
      fetchPlans();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to update discount' });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditPlanDialog = (plan: SubscriptionPlan) => {
    setEditPlanDialog(plan);
    setEditForm({
      name: plan.name,
      description: plan.description || '',
      price: plan.originalPrice || plan.price,
      durationDays: plan.durationDays,
      features: parseFeatures(plan.features),
      isActive: plan.isActive,
      roleToAssign: plan.roleToAssign || UserRole.PREMIUM_USER,
    });
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setEditForm(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
    setNewFeature('');
  };

  const handleSavePlan = async () => {
    if (!editPlanDialog) return;
    setIsSaving(true);
    try {
      await subscriptionsService.updatePlan(editPlanDialog.id.toString(), editForm);
      toast({ title: 'Plan Updated', description: 'Subscription plan has been saved' });
      setEditPlanDialog(null);
      fetchPlans();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to update plan' });
    } finally {
      setIsSaving(false);
    }
  };

  const getPlanGradient = (index: number) => {
    const gradients = [
      { card: 'from-indigo-500/15 to-blue-500/10 border-indigo-500/25', icon: 'from-indigo-600 to-blue-600', iconColor: 'text-indigo-400' },
      { card: 'from-purple-500/15 to-violet-500/10 border-purple-500/25', icon: 'from-purple-600 to-violet-600', iconColor: 'text-purple-400' },
      { card: 'from-amber-500/15 to-orange-500/10 border-amber-500/25', icon: 'from-amber-600 to-orange-600', iconColor: 'text-amber-400' },
    ];
    return gradients[index % gradients.length];
  };

  const activePlans = plans.filter(p => p.isActive);
  const inactivePlans = plans.filter(p => !p.isActive);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Subscription Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage pricing, features, and discounts</p>
        </div>
        <button
          onClick={fetchPlans}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white text-sm font-medium transition-all disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Plans', value: plans.length, icon: Crown, color: 'stat-card-purple', iconColor: 'text-purple-300' },
          { label: 'Active Plans', value: activePlans.length, icon: Check, color: 'stat-card-green', iconColor: 'text-emerald-300' },
          { label: 'With Discount', value: plans.filter(p => p.hasActiveDiscount).length, icon: Percent, color: 'stat-card-orange', iconColor: 'text-orange-300' },
        ].map(item => (
          <div key={item.label} className={`admin-card p-4 ${item.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{isLoading ? '—' : item.value}</div>
                <div className="text-xs text-white/50 mt-0.5">{item.label}</div>
              </div>
              <div className="p-2 rounded-xl bg-white/10">
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="admin-card p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 skeleton-pulse rounded-xl" />
                <div className="w-16 h-5 skeleton-pulse rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="w-32 h-6 skeleton-pulse rounded" />
                <div className="w-full h-3 skeleton-pulse rounded" />
              </div>
              <div className="w-24 h-10 skeleton-pulse rounded-xl" />
              <div className="space-y-1.5">
                {[1, 2, 3].map(j => <div key={j} className="w-full h-3 skeleton-pulse rounded" />)}
              </div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="admin-card flex items-center justify-center py-16">
          <div className="text-center">
            <Crown className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No subscription plans found</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const gradient = getPlanGradient(index);
            const features = parseFeatures(plan.features);
            return (
              <div
                key={plan.id}
                className={`admin-card p-5 bg-gradient-to-br border relative overflow-hidden ${gradient.card} ${plan.hasActiveDiscount ? 'ring-1 ring-amber-500/30' : ''}`}
              >
                {/* Discount Badge */}
                {plan.hasActiveDiscount && (
                  <div className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-bl-xl text-xs font-bold shadow-lg">
                    {plan.discountPercentage}% OFF
                  </div>
                )}

                {/* Plan Icon + Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient.icon} flex items-center justify-center`}>
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${plan.isActive ? 'badge-active' : 'badge-inactive'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Plan Name & Desc */}
                <h3 className="text-lg font-bold text-white mb-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{plan.description}</p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  {plan.hasActiveDiscount && plan.originalPrice && (
                    <span className="text-muted-foreground line-through text-sm">₹{plan.originalPrice}</span>
                  )}
                  <span className="text-3xl font-extrabold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    ₹{plan.effectivePrice || plan.price}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  {plan.durationDays} days validity
                </div>

                {/* Features */}
                <div className="space-y-1.5 mb-4 min-h-[72px]">
                  {features.slice(0, 4).map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${gradient.iconColor}`} />
                      <span className="text-xs text-white/70">{feature}</span>
                    </div>
                  ))}
                  {features.length > 4 && (
                    <p className="text-xs text-muted-foreground ml-5">+{features.length - 4} more</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-white/[0.08]">
                  <button
                    onClick={() => openEditPlanDialog(plan)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.08] transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Plan
                  </button>
                  <button
                    onClick={() => openDiscountDialog(plan)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/20 transition-colors"
                  >
                    <Percent className="w-3.5 h-3.5" /> Discount
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Plan Dialog */}
      <Dialog open={!!editPlanDialog} onOpenChange={() => setEditPlanDialog(null)}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Edit className="w-5 h-5 text-purple-400" /> Edit Plan · {editPlanDialog?.name}
            </DialogTitle>
            <DialogDescription>Modify plan details, pricing, and features.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="mt-2">
            <TabsList className="grid w-full grid-cols-2 bg-white/[0.05] border border-white/[0.08] rounded-xl p-1">
              <TabsTrigger value="details" className="rounded-lg text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">Details</TabsTrigger>
              <TabsTrigger value="features" className="rounded-lg text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">Features</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <FieldLabel label="Plan Name" id="plan-name" />
                <StyledInput id="plan-name" value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <FieldLabel label="Description" id="plan-desc" />
                <StyledTextarea id="plan-desc" rows={3} value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <FieldLabel label="Price (₹)" id="plan-price" />
                  <StyledInput id="plan-price" type="number" min="0" value={editForm.price} onChange={(e) => setEditForm(p => ({ ...p, price: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel label="Duration (Days)" id="plan-days" />
                  <StyledInput id="plan-days" type="number" min="1" value={editForm.durationDays} onChange={(e) => setEditForm(p => ({ ...p, durationDays: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <FieldLabel label="Roles to Assign" id="plan-role" />
                <select
                  id="plan-role"
                  value={editForm.roleToAssign}
                  onChange={(e) => setEditForm(p => ({ ...p, roleToAssign: e.target.value as UserRole }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none"
                >
                  <option value={UserRole.BASIC_USER} className="bg-gray-900">BASIC_USER (Tier 1)</option>
                  <option value={UserRole.PREMIUM_USER} className="bg-gray-900">PREMIUM_USER (Tier 2)</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <div>
                  <p className="text-sm text-white font-medium">Plan Active</p>
                  <p className="text-xs text-muted-foreground">Users can purchase this plan</p>
                </div>
                <Switch checked={editForm.isActive} onCheckedChange={(v) => setEditForm(p => ({ ...p, isActive: v }))} />
              </div>
            </TabsContent>
            <TabsContent value="features" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <StyledInput
                  placeholder="Add a feature..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                />
                <button onClick={handleAddFeature} className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {editForm.features.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No features added yet</p>
                ) : editForm.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="flex-1 text-sm text-white/80">{feature}</span>
                    <button onClick={() => setEditForm(p => ({ ...p, features: p.features.filter((_, j) => j !== i) }))} className="text-muted-foreground hover:text-red-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 mt-2">
            <button onClick={() => setEditPlanDialog(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] transition-all">
              Cancel
            </button>
            <button onClick={handleSavePlan} disabled={isSaving} className="px-4 py-2 rounded-xl text-sm font-semibold text-white btn-primary-gradient disabled:opacity-60">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={!!discountDialog} onOpenChange={() => setDiscountDialog(null)}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Percent className="w-5 h-5 text-amber-400" /> Set Discount · {discountDialog?.name}
            </DialogTitle>
            <DialogDescription>Set a discount percentage and optional expiry date.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <FieldLabel label="Discount Percentage" id="discount-pct" />
              <div className="flex items-center gap-2">
                <StyledInput
                  id="discount-pct"
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                />
                <span className="text-muted-foreground text-sm flex-shrink-0">%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <FieldLabel label="Valid Until (Optional)" id="discount-until" />
              <StyledInput
                id="discount-until"
                type="date"
                value={discountValidUntil}
                onChange={(e) => setDiscountValidUntil(e.target.value)}
              />
            </div>
            {discountPercentage > 0 && discountDialog && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-muted-foreground mb-1">New effective price:</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    ₹{Math.round((discountDialog.originalPrice || discountDialog.price) * (1 - discountPercentage / 100))}
                  </span>
                  <span className="text-muted-foreground line-through text-sm">₹{discountDialog.originalPrice || discountDialog.price}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <button onClick={() => setDiscountDialog(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] transition-all">
              Cancel
            </button>
            <button onClick={handleSaveDiscount} disabled={isSaving} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-60">
              {isSaving ? 'Saving...' : 'Save Discount'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
