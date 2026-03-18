'use client';

import { useEffect, useState } from 'react';
import { Users, Heart, HeartHandshake, TrendingUp } from 'lucide-react';
import { publicStatsService, PublicStats } from '@/services/public-stats.service';

interface StatItemProps {
    value: number;
    label: string;
    icon: React.ReactNode;
}

function StatItem({ value, label, icon }: StatItemProps) {
    return (
        <div className="flex flex-col items-center text-center p-6">
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                {icon}
            </div>
            <div className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-2">
                {value.toLocaleString()}+
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">
                {label}
            </div>
        </div>
    );
}

export function PublicStatsSection() {
    const [stats, setStats] = useState<PublicStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await publicStatsService.getPublicStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch public stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading || !stats) {
        return null; // Don't show section while loading
    }

    return (
        <section className="py-16 bg-gradient-to-b from-background to-muted/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
                        Trusted by Thousands
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Join the largest matrimony community in Chhattisgarh
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
                    <StatItem
                        value={stats.totalUsers}
                        label="Registered Users"
                        icon={<Users className="h-6 w-6" />}
                    />
                    <StatItem
                        value={stats.activeProfiles}
                        label="Active Profiles"
                        icon={<TrendingUp className="h-6 w-6" />}
                    />
                    <StatItem
                        value={stats.totalMatches}
                        label="Matches Made"
                        icon={<Heart className="h-6 w-6" />}
                    />
                    <StatItem
                        value={stats.successfulMatches}
                        label="Success Stories"
                        icon={<HeartHandshake className="h-6 w-6" />}
                    />
                </div>
            </div>
        </section>
    );
}
