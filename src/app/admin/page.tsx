'use client';

import { useEffect, useState } from 'react';
import { 
  Users, DollarSign, FileWarning, RefreshCw, TrendingUp,
  TrendingDown, ArrowRight, Activity, BarChart3, Zap, Crown, 
  Eye, AlertTriangle, Heart
} from 'lucide-react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import { analyticsService, type RevenueAnalytics, type SignupAnalytics, type SubscriptionAnalytics } from '@/services/analytics.service';
import type { DashboardStats, User } from '@/types/api.types';
import { formatDistanceToNow } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

function StatCard({
  title, value, subtitle, icon: Icon, trend, colorClass, delay = ''
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: number;
  colorClass: string;
  delay?: string;
}) {
  const isPositive = trend === undefined ? null : trend >= 0;
  return (
    <div className={`admin-card p-5 ${colorClass} animate-slide-up ${delay}`} style={{ animationFillMode: 'both' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-white/10">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <p className="text-xs text-white/60 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-xs text-white/40 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number | string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[hsl(222_40%_9%)] border border-white/10 rounded-xl p-3">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((p: { name: string; value: number | string }, i: number) => (
          <p key={i} className="text-sm font-semibold text-white">
            {p.name === 'revenue' ? `₹${Number(p.value).toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [signupData, setSignupData] = useState<SignupAnalytics | null>(null);
  const [subData, setSubData] = useState<SubscriptionAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, usersData, revData, signData, subsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentUsers(5),
        analyticsService.getRevenueAnalytics(6),
        analyticsService.getSignupAnalytics(5),
        analyticsService.getSubscriptionAnalytics(),
      ]);
      setStats(statsData);
      setRecentUsers(usersData);
      setRevenueData(revData);
      setSignupData(signData);
      setSubData(subsData);
    } catch (err: unknown) {
      const errorMsg = err as { message?: string };
      setError(errorMsg.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); 
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-16 h-16 rounded-full stat-card-red flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-400 font-medium">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? (isLoading ? '—' : 0),
      subtitle: signupData?.growth ? `${signupData.growth > 0 ? '+' : ''}${signupData.growth}% from last month` : `${stats?.totalProfiles ?? 0} profiles`,
      icon: Users,
      trend: signupData?.growth,
      colorClass: 'stat-card-purple',
      delay: 'stagger-1',
    },
    {
      title: 'Total Revenue',
      value: `₹${(revenueData?.totalRevenue ?? 0).toLocaleString()}`,
      subtitle: revenueData?.growth ? `${revenueData.growth > 0 ? '+' : ''}${revenueData.growth}% vs last month` : 'Total earned',
      icon: DollarSign,
      trend: revenueData?.growth,
      colorClass: 'stat-card-green',
      delay: 'stagger-2',
    },
    {
      title: 'Active Subscriptions',
      value: subData?.activeSubscriptions ?? (isLoading ? '—' : 0),
      subtitle: subData?.mostPopularPlan ? `Top: ${subData.mostPopularPlan}` : 'Current active plans',
      icon: Crown,
      colorClass: 'stat-card-blue',
      delay: 'stagger-3',
    },
    {
      title: 'Pending Reports',
      value: stats?.pendingReports ?? (isLoading ? '—' : 0),
      subtitle: 'Needs immediate review',
      icon: FileWarning,
      colorClass: stats?.pendingReports ? 'stat-card-red' : 'stat-card-orange',
      delay: 'stagger-4',
    },
    {
      title: 'Success Stories',
      value: stats?.pendingStories ?? (isLoading ? '—' : 0),
      subtitle: 'Stories for approval',
      icon: Heart,
      colorClass: 'stat-card-purple',
      delay: 'stagger-1',
    },
  ];

  return (
    <div className="space-y-6 max-w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white text-sm font-medium transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Additional Quick Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Total Profiles', value: stats?.totalProfiles ?? 0, icon: Users, color: 'text-purple-400' },
          { label: 'Total Matches', value: stats?.totalMatches ?? 0, icon: Activity, color: 'text-blue-400' },
          { label: 'Total Messages', value: stats?.totalMessages ?? 0, icon: Zap, color: 'text-emerald-400' }
        ].map((item, i) => (
          <div key={item.label} className={`admin-card p-4 animate-slide-up stagger-${i + 1}`} style={{ animationFillMode: 'both' }}>
            <div className="flex items-center gap-2.5">
              <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
              <div className="min-w-0">
                <div className="text-lg font-bold text-white">
                  {isLoading ? '—' : item.value.toLocaleString()}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{item.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-7">
        {/* Revenue Chart */}
        <div className="admin-card p-5 lg:col-span-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue · Last 6 months</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              {revenueData?.growth ?? 0}%
            </div>
          </div>
          <div className="h-[240px] notranslate">
            {isLoading ? (
              <div className="h-full skeleton-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={240}>
                <AreaChart data={revenueData?.data || []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#revGradient)" dot={false} activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Districts */}
        <div className="admin-card p-5 lg:col-span-3">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Top Districts</h3>
            <p className="text-xs text-muted-foreground">Users by registration district</p>
          </div>
          <div className="h-[240px] notranslate">
            {isLoading ? (
              <div className="h-full skeleton-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={240}>
                <BarChart data={signupData?.data || []} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="district" type="category" width={75} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="users" fill="#06b6d4" radius={[0, 6, 6, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-7">
        {/* Subscription Pie */}
        <div className="admin-card p-5 lg:col-span-3">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Plan Distribution</h3>
            <p className="text-xs text-muted-foreground">Active subscription breakdown</p>
          </div>
          <div className="h-[240px] notranslate">
            {isLoading ? (
              <div className="h-full skeleton-pulse rounded-xl" />
            ) : subData?.breakdown && subData.breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={240}>
                <PieChart>
                  <Pie
                    data={subData.breakdown}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="plan"
                  >
                    {subData.breakdown.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No active subscriptions
              </div>
            )}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="admin-card p-5 lg:col-span-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Recent Registrations</h3>
              <p className="text-xs text-muted-foreground">Latest user sign-ups</p>
            </div>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 skeleton-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recentUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No recent users</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/40 to-indigo-600/40 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-purple-300">
                          {user.profile ? user.profile.firstName?.charAt(0)?.toUpperCase() : user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'No profile'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${user.isBanned ? 'badge-banned' : user.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card p-5">
        <h3 className="text-base font-semibold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Review Reports', href: '/admin/reports', color: 'from-red-500/20 to-red-600/10 border-red-500/20', textColor: 'text-red-400', icon: FileWarning, count: stats?.pendingReports },
            { label: 'Verify Profiles', href: '/admin/verifications', color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20', textColor: 'text-yellow-400', icon: Eye },
            { label: 'Manage Users', href: '/admin/users', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20', textColor: 'text-blue-400', icon: Users },
            { label: 'Push Notifs', href: '/admin/notifications', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20', textColor: 'text-purple-400', icon: BarChart3 },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border bg-gradient-to-br ${action.color} hover:scale-[1.02] transition-all duration-200 text-center`}
            >
              {action.count ? (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                  {action.count}
                </span>
              ) : null}
              <action.icon className={`w-6 h-6 ${action.textColor}`} />
              <span className={`text-xs font-semibold ${action.textColor}`}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
