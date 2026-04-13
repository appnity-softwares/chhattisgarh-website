"use client"

import { useEffect, useState } from 'react';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { DollarSign, Users, ShoppingCart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsService, RevenueAnalytics, SignupAnalytics, SubscriptionAnalytics } from "@/services/analytics.service";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const revenueChartConfig = {
    revenue: {
        label: "Revenue",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig

const signupsChartConfig = {
    users: {
        label: "New Users",
        color: "hsl(var(--accent))",
    }
} satisfies ChartConfig

export default function AdminAnalyticsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [months, setMonths] = useState(6);
    const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
    const [signupsData, setSignupsData] = useState<SignupAnalytics | null>(null);
    const [subscriptionData, setSubscriptionData] = useState<SubscriptionAnalytics | null>(null);

    const fetchAnalytics = async (monthCount: number = months) => {
        setIsLoading(true);
        try {
            const [revenue, signups, subscriptions] = await Promise.all([
                analyticsService.getRevenueAnalytics(monthCount),
                analyticsService.getSignupAnalytics(6),
                analyticsService.getSubscriptionAnalytics(),
            ]);
            setRevenueData(revenue);
            setSignupsData(signups);
            setSubscriptionData(subscriptions);
        } catch (err: unknown) {
            console.error('Failed to fetch analytics:', err);
            const errorMsg = err as { message?: string };
            toast({
                variant: 'destructive',
                title: 'Error',
                description: errorMsg.message || 'Failed to load analytics',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePeriodChange = (value: string) => {
        const newMonths = parseInt(value);
        setMonths(newMonths);
        fetchAnalytics(newMonths);
    };

    const formatCurrency = (value: number) => {
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
        return `₹${value}`;
    };

    return (
        <AdminPageWrapper>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-headline">Analytics Dashboard</h1>
                    <div className="flex gap-2">
                        <Select value={months.toString()} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">Last 3 months</SelectItem>
                                <SelectItem value="6">Last 6 months</SelectItem>
                                <SelectItem value="12">Last 12 months</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => fetchAnalytics()} disabled={isLoading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full" />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Skeleton className="h-80 w-full" />
                            <Skeleton className="h-80 w-full" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(revenueData?.totalRevenue || 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {revenueData?.growth ? (
                                            <span className={revenueData.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                                                {revenueData.growth >= 0 ? '+' : ''}{revenueData.growth}%
                                            </span>
                                        ) : null} from last month
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">New Users (30d)</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        +{signupsData?.newUsers30d || 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {signupsData?.growth ? (
                                            <span className={signupsData.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                                                {signupsData.growth >= 0 ? '+' : ''}{signupsData.growth}%
                                            </span>
                                        ) : null} from previous period
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {subscriptionData?.activeSubscriptions || 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {subscriptionData?.mostPopularPlan} is most popular
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue Overview</CardTitle>
                                    <CardDescription>Last 6 months</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {revenueData?.data && revenueData.data.length > 0 ? (
                                        <ChartContainer config={revenueChartConfig} className="h-[250px] w-full min-h-[250px]">
                                            <LineChart data={revenueData.data} margin={{ left: -20, right: 20 }}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                                <Tooltip content={<ChartTooltipContent />} />
                                                <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ChartContainer>
                                    ) : (
                                        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                            No revenue data available
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Sign-ups by District</CardTitle>
                                    <CardDescription>Top districts</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {signupsData?.data && signupsData.data.length > 0 ? (
                                        <ChartContainer config={signupsChartConfig} className="h-[250px] w-full min-h-[250px]">
                                            <BarChart data={signupsData.data} margin={{ left: -20, right: 20 }}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="district" tickLine={false} axisLine={false} tickMargin={8} />
                                                <YAxis />
                                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                                <Bar dataKey="users" fill="var(--color-users)" radius={4} />
                                            </BarChart>
                                        </ChartContainer>
                                    ) : (
                                        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                            No signup data available
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </AdminPageWrapper>
    )
}
