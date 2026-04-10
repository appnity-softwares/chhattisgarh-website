"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    SlidersHorizontal, 
    Filter, 
    X, 
    CheckCircle2, 
    Loader2,
    MapPin,
    Briefcase,
    GraduationCap,
    Heart,
    ChevronDown,
    TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ProfileCard } from "@/components/profile/profile-card";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useInfiniteProfiles } from "@/hooks/use-infinite-profiles";

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [ageRange, setAgeRange] = useState([18, 50]);

    // Use our hook
    const { 
        data, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        isLoading,
        refetch
    } = useInfiniteProfiles({
        search: searchQuery,
        minAge: ageRange[0],
        maxAge: ageRange[1]
    });

    // Flatten pages into a single array
    const profiles = data?.pages.flatMap(page => page.profiles) || [];

    useEffect(() => {
        if (searchQuery.length > 2) {
            setIsSearching(true);
            const timer = setTimeout(() => setIsSearching(false), 800);
            return () => clearTimeout(timer);
        }
    }, [searchQuery]);

    return (
        <div className="space-y-8 pb-20">
            {/* Header & Search Bar */}
            <div className="flex flex-col gap-8">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-foreground">Find Your <span className="text-primary italic">Soulmate</span></h1>
                    <p className="text-muted-foreground font-light text-lg">Search by Name, City, or ID with advanced filters</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Type Name, Profession or City..." 
                            className="h-16 pl-14 pr-6 bg-card/40 backdrop-blur-xl border-white/5 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/5 focus:ring-primary/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {isSearching && (
                            <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            </div>
                        )}
                    </div>
                    <Button 
                        onClick={() => setShowFilters(!showFilters)}
                        variant="outline" 
                        className={`h-16 px-8 rounded-2xl border-white/10 font-black text-sm uppercase tracking-widest gap-3 transition-all ${showFilters ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-card/40 backdrop-blur-xl hover:bg-white/5'}`}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        Filters
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Advanced Filters Sidebar */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: "auto" }}
                            exit={{ opacity: 0, x: -20, width: 0 }}
                            className="lg:col-span-3 space-y-6 overflow-hidden"
                        >
                            <Card className="bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] shadow-3xl">
                                <CardContent className="p-8 space-y-10">
                                    {/* Age Range */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Age Range</Label>
                                            <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">{ageRange[0]} - {ageRange[1]} Yrs</Badge>
                                        </div>
                                        <Slider 
                                            defaultValue={[18, 30]} 
                                            max={60} 
                                            min={18} 
                                            step={1} 
                                            onValueChange={setAgeRange}
                                            className="py-4"
                                        />
                                    </div>

                                    {/* Community Filters */}
                                    <div className="space-y-6 border-t border-white/5 pt-8">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Religion & Community</Label>
                                        <div className="space-y-4">
                                            <Select defaultValue="any">
                                                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl font-bold">
                                                    <SelectValue placeholder="Religion" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="any">All Religions</SelectItem>
                                                    <SelectItem value="hindu">Hindu</SelectItem>
                                                    <SelectItem value="muslim">Muslim</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select defaultValue="any">
                                                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl font-bold">
                                                    <SelectValue placeholder="Caste" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="any">Open to All Castes</SelectItem>
                                                    <SelectItem value="sahu">Sahu</SelectItem>
                                                    <SelectItem value="verma">Verma</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Career Filters */}
                                    <div className="space-y-6 border-t border-white/5 pt-8">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Education & Career</Label>
                                        <div className="space-y-4">
                                            <Select defaultValue="any">
                                                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl font-bold">
                                                    <SelectValue placeholder="Education" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="any">Any Level</SelectItem>
                                                    <SelectItem value="masters">Masters</SelectItem>
                                                    <SelectItem value="doctorate">Doctorate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select defaultValue="any">
                                                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl font-bold">
                                                    <SelectValue placeholder="Income" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="any">Any Income</SelectItem>
                                                    <SelectItem value="8+">₹8L+ Per Annum</SelectItem>
                                                    <SelectItem value="15+">₹15L+ Per Annum</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button onClick={() => refetch()} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20">
                                        APPLY FILTERS
                                    </Button>
                                    <button 
                                        onClick={() => {
                                            setAgeRange([18, 50]);
                                            setSearchQuery("");
                                        }}
                                        className="w-full text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                                        Reset All
                                    </button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Main Area */}
                <div className={`${showFilters ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-8`}>
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                                {isLoading ? "Searching Profiles..." : `Found ${profiles.length} Profiles`}
                            </span>
                            <div className="w-px h-4 bg-white/10" />
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Now</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sort By:</span>
                            <Select defaultValue="recent">
                                <SelectTrigger className="w-32 h-9 bg-transparent border-white/5 text-[10px] font-black uppercase tracking-widest focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card/90 backdrop-blur-xl border-white/10">
                                    <SelectItem value="recent">Recently Joined</SelectItem>
                                    <SelectItem value="active">Most Active</SelectItem>
                                    <SelectItem value="distance">Nearest to Me</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className={`grid gap-8 ${showFilters ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                        {isLoading ? (
                            <div className="col-span-full py-20 flex justify-center items-center">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : profiles.length === 0 ? (
                            <div className="col-span-full py-20 flex flex-col justify-center items-center text-muted-foreground">
                                <Search className="w-12 h-12 mb-4 opacity-50" />
                                <h3 className="text-xl font-bold">No Profiles Found</h3>
                                <p>Try adjusting your search filters.</p>
                            </div>
                        ) : profiles.map((profile, i) => (
                            <motion.div 
                                key={profile.id} 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ delay: i * 0.05 }}
                            >
                                <ProfileCard 
                                    id={profile.id}
                                    name={`${profile.firstName} ${profile.lastName}`} 
                                    age={profile.age} 
                                    city={profile.city} 
                                    occupation={profile.occupation} 
                                    education={profile.education} 
                                    image={profile.media?.[0]?.url} 
                                    isVerified={profile.isVerified} 
                                    gender={profile.gender?.toLowerCase() as 'male'|'female' || 'female'} 
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination / Loaded more */}
                    {hasNextPage && (
                        <div className="flex flex-col items-center py-10 space-y-6">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                            <Button 
                                variant="ghost" 
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="h-14 px-10 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 font-bold text-muted-foreground hover:text-foreground group"
                            >
                                {isFetchingNextPage ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <>
                                        LOAD MORE PROFILES
                                        <ChevronDown className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
