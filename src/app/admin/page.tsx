'use client';

import { useEffect, useState } from 'react';
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, UserCheck, Users, FileWarning, RefreshCw, TrendingUp } from "lucide-react";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { analyticsService, type RevenueAnalytics, type SignupAnalytics, type SubscriptionAnalytics } from "@/services/analytics.service";
import type { DashboardStats, User, MatchRequest } from "@/types/api.types";
import { formatDistanceToNow } from 'date-fns';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    const [recentMatches, setRecentMatches] = useState<MatchRequest[]>([]);

    // Analytics Data
    const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
    const [signupData, setSignupData] = useState<SignupAnalytics | null>(null);
    const [subData, setSubData] = useState<SubscriptionAnalytics | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [
                statsData,
                usersData,
                matchesData,
                revData,
                signData,
                subsData
            ] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getRecentUsers(5),
                adminService.getRecentMatches(5),
                analyticsService.getRevenueAnalytics(6),
                analyticsService.getSignupAnalytics(5),
                analyticsService.getSubscriptionAnalytics()
            ]);

            setStats(statsData);
            setRecentUsers(usersData);
            setRecentMatches(matchesData);
            setRevenueData(revData);
            setSignupData(signData);
            setSubData(subsData);

        } catch (err: any) {
            console.error('Failed to fetch dashboard data:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const statsCards = [
        {
            title: "Total Users",
            value: stats?.totalUsers || 0,
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
            change: signupData?.growth ? `${signupData.growth > 0 ? '+' : ''}${signupData.growth}% from last month` : `${stats?.totalProfiles || 0} profiles`
        },
        {
            title: "Total Revenue",
            value: `₹${revenueData?.totalRevenue?.toLocaleString() || 0}`,
            icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
            change: revenueData?.growth ? `${revenueData.growth > 0 ? '+' : ''}${revenueData.growth}% from last month` : "Total earned"
        },
        {
            title: "Active Subscriptions",
            value: subData?.activeSubscriptions || 0,
            icon: <UserCheck className="h-4 w-4 text-muted-foreground" />,
            change: subData?.mostPopularPlan ? `Top plan: ${subData.mostPopularPlan}` : "Current active plans"
        },
        {
            title: "Pending Reports",
            value: stats?.pendingReports || 0,
            icon: <FileWarning className="h-4 w-4 text-muted-foreground" />,
            change: "needs review"
        },
    ];

    if (error) {
        return (
            <AdminPageWrapper>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <p className="text-destructive">{error}</p>
                    <Button onClick={fetchData}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                </div>
            </AdminPageWrapper>
        );
    }

    return (
        <AdminPageWrapper>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map(stat => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                {stat.icon}
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-20" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
                                        <p className="text-xs text-muted-foreground">{stat.change}</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-7">
                    {/* Revenue Chart - Takes up 4 columns */}
                    <Card className="col-span-1 md:col-span-4">
                        <CardHeader>
                            <CardTitle>Revenue Overview</CardTitle>
                            <CardDescription>Monthly revenue for the last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            {isLoading ? (
                                <Skeleton className="h-[300px] w-full" />
                            ) : (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueData?.data || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                                            <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Signups by District - Takes up 3 columns */}
                    <Card className="col-span-1 md:col-span-3">
                        <CardHeader>
                            <CardTitle>Top Districts</CardTitle>
                            <CardDescription>User registrations by district</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-[300px] w-full" />
                            ) : (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={signupData?.data || []} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="district" type="category" width={80} fontSize={12} />
                                            <Tooltip />
                                            <Bar dataKey="users" fill="#00C49F" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row - Subscription & Recent Users */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-7">
                    {/* Subscription Distribution - Takes up 3 columns */}
                    <Card className="col-span-1 md:col-span-3">
                        <CardHeader>
                            <CardTitle>Subscription Plans</CardTitle>
                            <CardDescription>Distribution of active subscriptions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-[300px] w-full" />
                            ) : subData?.breakdown && subData.breakdown.length > 0 ? (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={subData.breakdown}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="count"
                                                nameKey="plan"
                                            >
                                                {subData.breakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                    No active subscriptions
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Registrations - Takes up 4 columns */}
                    <Card className="col-span-1 md:col-span-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Registrations</CardTitle>
                            <Link href="/admin/users">
                                <Button variant="outline" size="sm">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Joined</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                    No recent users
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            recentUsers.map(user => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'No Name'}</span>
                                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.isBanned ? 'destructive' : user.isActive ? 'default' : 'secondary'}>
                                                            {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminPageWrapper>
    );
}
