'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { 
  CreditCard, Shield, Save, RefreshCw, Key, 
  Settings as SettingsIcon, AlertCircle, CheckCircle2,
  Lock, Globe, BellRing, Database
} from 'lucide-react';
import { adminService } from "@/services/admin.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [_settings, setSettings] = useState<unknown>(null);
  
  // Razorpay State
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getSettings();
      setSettings(data);
      
      // Initialize Razorpay fields if they exist in DB
      if (data.PAYMENTS) {
        const id = data.PAYMENTS.find((s: unknown) => s.key === 'RAZORPAY_KEY_ID');
        if (id) setRazorpayKeyId(id.value === '********' ? '' : id.value);
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error fetching settings",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdateRazorpay = async () => {
    if (!razorpayKeyId || !razorpayKeySecret) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Both Key ID and Key Secret are required."
      });
      return;
    }

    try {
      setSaving(true);
      await adminService.updateRazorpaySettings(razorpayKeyId, razorpayKeySecret);
      toast({
        title: "Settings Updated",
        description: "Razorpay credentials have been validated and saved successfully."
      });
      setRazorpayKeySecret(''); // Clear secret for security
      fetchSettings();
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to validate Razorpay credentials."
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-48 bg-background rounded-lg mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-background rounded-xl col-span-2" />
          <div className="h-64 bg-background rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          System Settings
        </h1>
        <p className="text-muted-foreground">Manage global application configurations and API integrations.</p>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="bg-background border border-border p-1">
          <TabsTrigger value="payments" className="data-[state=active]:bg-primary data-[state=active]:text-white flex gap-2">
            <CreditCard className="w-4 h-4" /> Payments
          </TabsTrigger>
          <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-white flex gap-2">
            <Globe className="w-4 h-4" /> General
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-white flex gap-2">
            <Shield className="w-4 h-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-background border-border overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-border bg-background">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground">Razorpay Integration</CardTitle>
                      <CardDescription>Live update your payment gateway credentials.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <Alert className="bg-gold/20 border-gold/35 text-primaryDark">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important Note</AlertTitle>
                    <AlertDescription className="text-xs">
                      Updating these keys will immediately affect all new payment requests. 
                      Ensure the keys belong to a **Live** Razorpay account for production use.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        Razorpay Key ID
                      </label>
                      <Input
                        value={razorpayKeyId}
                        onChange={(e) => setRazorpayKeyId(e.target.value)}
                        placeholder="rzp_live_xxxxxxxxxxxx"
                        className="bg-background border-border text-foreground h-11 focus:ring-primary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        Razorpay Key Secret
                      </label>
                      <Input
                        type="password"
                        value={razorpayKeySecret}
                        onChange={(e) => setRazorpayKeySecret(e.target.value)}
                        placeholder="Enter your key secret"
                        className="bg-background border-border text-foreground h-11 focus:ring-primary/50"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        For security, the secret is never displayed once saved. Always provide a fresh secret to update.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={fetchSettings}
                      disabled={saving}
                      className="bg-transparent border-border text-foreground hover:bg-background"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                      Discard
                    </Button>
                    <Button 
                      onClick={handleUpdateRazorpay} 
                      disabled={saving}
                      className="bg-primary hover:bg-primary/90 text-white min-w-[140px]"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Apply Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background border-border shadow-2xl">
                <CardHeader className="border-b border-border bg-background">
                  <CardTitle className="text-foreground text-base">Payment Logs Connectivity</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                   <div className="flex items-center gap-4 p-4 rounded-xl bg-success/10 border border-success/25">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-foreground">System Verified</h4>
                        <p className="text-xs text-muted-foreground">The payment system is currently using the live configurations provided above.</p>
                      </div>
                      <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-full uppercase tracking-wider">
                        Active
                      </span>
                   </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-background border-border shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" /> Security Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">SSL Encryption</span>
                    <span className="text-success font-bold">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Secret Masking</span>
                    <span className="text-success font-bold">Active</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Admin Audit</span>
                    <span className="text-success font-bold">Enabled</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background border-border shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" /> Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-3">
                  <p>All configuration changes are logged with your administrator ID and IP address for compliance.</p>
                  <Button variant="link" className="text-primary p-0 h-auto text-xs">View Activity Logs</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="bg-background border-border">
              <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Globe className="w-12 h-12 mb-4 opacity-20" />
                <p>General site settings appearing coming soon.</p>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="bg-background border-border">
              <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <BellRing className="w-12 h-12 mb-4 opacity-20" />
                <p>Security and notification settings coming soon.</p>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
