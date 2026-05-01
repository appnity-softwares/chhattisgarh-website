'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { marketingService } from '@/services/marketing.service';
import { PromoCode } from '@/types/api.types';
import { Loader2, Ticket, Plus, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PromoCodes() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [codes, setCodes] = useState<PromoCode[]>([]);
    
    const [newCode, setNewCode] = useState({
        code: '',
        discount: 10,
        type: 'PERCENTAGE',
        expiresAt: '2026-12-31'
    });

    useEffect(() => {
        loadCodes();
    }, []);

    const loadCodes = async () => {
        try {
            setLoading(true);
            const data = await marketingService.getPromoCodes();
            setCodes(data || []);
        } catch (error) {
            console.error('Failed to load codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newCode.code) return;
        try {
            setSaving(true);
            await marketingService.createPromoCode(newCode);
            toast({ title: 'Success', description: 'Promo code created.' });
            setNewCode({ code: '', discount: 10, type: 'PERCENTAGE', expiresAt: '2026-12-31' });
            loadCodes();
        } catch {
            toast({ title: 'Error', description: 'Failed to create code', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this promo code?')) return;
        try {
            await marketingService.deletePromoCode(id);
            toast({ title: 'Success', description: 'Promo code deleted.' });
            loadCodes();
        } catch {
            toast({ title: 'Error', description: 'Failed to delete code', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Promo & Referral Codes</h1>
                <p className="text-muted-foreground">Manage marketing campaigns and referral triggers.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Create New */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            Create Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Coupon Code</Label>
                            <Input 
                                placeholder="E.g. CG2026" 
                                value={newCode.code}
                                onChange={(e) => setNewCode({...newCode, code: e.target.value.toUpperCase()})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Value</Label>
                                <Input 
                                    type="number" 
                                    value={newCode.discount}
                                    onChange={(e) => setNewCode({...newCode, discount: Number(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={newCode.type} onValueChange={(val: 'PERCENTAGE' | 'FLAT') => setNewCode({...newCode, type: val})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">% Off</SelectItem>
                                        <SelectItem value="FLAT">Flat ₹</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input 
                                type="date" 
                                value={newCode.expiresAt}
                                onChange={(e) => setNewCode({...newCode, expiresAt: e.target.value})}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleCreate} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 animate-spin" /> : <Ticket className="mr-2 w-4 h-4" />}
                            Generate Promo Code
                        </Button>
                    </CardFooter>
                </Card>

                {/* List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Active Coupons & Analytics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <div className="space-y-4">
                                {codes.map((code) => (
                                    <div key={code.id} className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <Ticket className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-lg leading-none">{code.code}</h4>
                                                    <Badge variant={code.isActive ? "default" : "secondary"}>
                                                        {code.isActive ? 'Active' : 'Expired'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3" />
                                                        Used {code.usageCount} times
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Expires: {code.expiresAt}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-primary">
                                                {code.discountType === 'PERCENTAGE' ? `${code.discount}%` : `₹${code.discount}`} OFF
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(code.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
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
