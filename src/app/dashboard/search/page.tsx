"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Search as SearchIcon,
    SlidersHorizontal,
    Loader2,
    ChevronDown,
    X,
    Filter,
    Zap
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
import { useUserAccess } from "@/hooks/use-user-access";
import { formatProfileName } from "@/lib/display-format";

export default function SearchPage() {
    const { data: access } = useUserAccess();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [ageRange, setAgeRange] = useState([18, 50]);

    // Filter states
    const [filters, setFilters] = useState({
        religion: 'any',
        community: 'any',
        occupation: 'any',
        education: 'any',
        gender: 'any',
        location: '',
        maritalStatus: 'any',
        category: 'any',
        district: 'any',
        manglik: 'any',
        diet: 'any',
        speaksChhattisgarhi: 'any'
    });

    const [heightRange, setHeightRange] = useState([120, 210]);
    const selectedDistrict = filters.district !== 'any' ? filters.district : undefined;
    const cityFilter = filters.location || selectedDistrict;

    // Use our hook with all filters
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
        maxAge: ageRange[1],
        religions: filters.religion !== 'any' ? filters.religion : undefined,
        castes: filters.community !== 'any' ? filters.community : undefined,
        occupation: filters.occupation !== 'any' ? filters.occupation : undefined,
        education: filters.education !== 'any' ? filters.education : undefined,
        gender: filters.gender !== 'any' ? filters.gender : undefined,
        city: cityFilter || undefined,
        maritalStatus: filters.maritalStatus !== 'any' ? filters.maritalStatus : undefined,
        category: filters.category !== 'any' ? filters.category : undefined,
        manglik: filters.manglik !== 'any' ? filters.manglik : undefined,
        diet: filters.diet !== 'any' ? filters.diet : undefined,
        speaksChhattisgarhi: filters.speaksChhattisgarhi === 'yes' ? true : filters.speaksChhattisgarhi === 'no' ? false : undefined,
        minHeight: heightRange[0],
        maxHeight: heightRange[1]
    });

    // Flatten pages into a single array
    const allProfiles = data?.pages.flatMap(page => page.profiles) || [];

    const [hiddenIds, setHiddenIds] = useState<Set<number | string>>(new Set());

    const handleActionSuccess = (id: number | string) => {
        setHiddenIds(prev => new Set(prev).add(id));
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setIsSearching(true);
        // Auto-refetch after filter change
        setTimeout(() => {
            refetch();
        }, 300);
    };

    const handleAgeRangeChange = (range: number[]) => {
        setAgeRange(range);
        setIsSearching(true);
        setTimeout(() => {
            refetch();
        }, 300);
    };

    const clearFilters = () => {
        setFilters({
            religion: 'any',
            community: 'any',
            occupation: 'any',
            education: 'any',
            gender: 'any',
            location: '',
            maritalStatus: 'any',
            category: 'any',
            district: 'any',
            manglik: 'any',
            diet: 'any',
            speaksChhattisgarhi: 'any'
        });
        setAgeRange([18, 50]);
        setHeightRange([120, 210]);
        setSearchQuery('');
        refetch();
    };

    const profiles = allProfiles.filter(p => !hiddenIds.has(p.id));

    useEffect(() => {
        if (isSearching) {
            const timer = setTimeout(() => setIsSearching(false), 800);
            return () => clearTimeout(timer);
        }
    }, [isSearching]);

    return (
        <div className="space-y-6 pb-20 max-w-[1600px] mx-auto">
            {/* Minimal Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black tracking-tighter uppercase text-foreground flex items-center gap-2">
                             Soulmate <span className="text-primary italic">Cloud</span>
                             <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-2 h-5">Live Search</Badge>
                        </h1>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest opacity-60">Search name, city or id with precision</p>
                    </div>
                    <Button
                        onClick={() => setShowFilters(!showFilters)}
                        variant="ghost"
                        size="sm"
                        className={`h-9 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] gap-2 border border-white/5 ${showFilters ? 'bg-primary/10 text-primary' : 'bg-white/5 text-muted-foreground'}`}
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                </div>

                <div className="relative group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-primary transition-all" />
                    <Input
                        placeholder="Search by name, city or keyword..."
                        className="h-12 pl-12 pr-6 bg-white/5 border-white/5 rounded-xl text-sm font-bold focus:ring-primary/20 transition-all border-t border-l border-white/10"
                        value={searchQuery}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSearchQuery(val);
                            if (val.length > 2) {
                                setIsSearching(true);
                                setTimeout(() => refetch(), 500);
                            } else {
                                setIsSearching(false);
                                setTimeout(() => refetch(), 500);
                            }
                        }}
                    />
                    {isSearching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start">
                {/* Advanced Filters Sidebar - Compact version */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="lg:col-span-1 space-y-4"
                        >
                            <Card className="bg-[#0f0f0f] border-white/5 rounded-[1.5rem] shadow-xl border-t border-l border-white/10">
                                <CardContent className="p-5 space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Filter className="w-3 h-3 text-primary" />
                                        <h4 className="text-[10px] font-black uppercase tracking-[.3em] text-white">Advanced Search</h4>
                                    </div>

                                    {/* Age Range Slider */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Age range</Label>
                                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">{ageRange[0]} - {ageRange[1]}</span>
                                        </div>
                                        <Slider
                                            value={ageRange}
                                            max={65}
                                            min={18}
                                            step={1}
                                            onValueChange={(val) => handleAgeRangeChange(val)}
                                            className="py-2"
                                        />
                                    </div>

                                    {/* Height Range Slider */}
                                    <div className="space-y-4 pt-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Height range (cm)</Label>
                                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">{heightRange[0]} - {heightRange[1]}</span>
                                        </div>
                                        <Slider
                                            value={heightRange}
                                            max={210}
                                            min={120}
                                            step={1}
                                            onValueChange={(val) => setHeightRange(val)}
                                            className="py-2"
                                        />
                                    </div>

                                    {/* Categorized Selects */}
                                    <div className="space-y-2.5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Demographics</Label>
                                        <Select value={filters.religion} onValueChange={(value) => handleFilterChange('religion', value)}>
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl font-bold text-xs">
                                                <SelectValue placeholder="Religion" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10 text-xs">
                                                <SelectItem value="any">Any Religion</SelectItem>
                                                <SelectItem value="hindu">Hindu</SelectItem>
                                                <SelectItem value="muslim">Muslim</SelectItem>
                                                <SelectItem value="jain">Jain</SelectItem>
                                                <SelectItem value="sikh">Sikh</SelectItem>
                                                <SelectItem value="christian">Christian</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={filters.community} onValueChange={(value) => handleFilterChange('community', value)}>
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl font-bold text-xs">
                                                <SelectValue placeholder="Community" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10">
                                                <SelectItem value="any">Open to All</SelectItem>
                                                <SelectItem value="sahu">Sahu</SelectItem>
                                                <SelectItem value="verma">Verma</SelectItem>
                                                <SelectItem value="agarwal">Agarwal</SelectItem>
                                                <SelectItem value="sharma">Sharma</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl font-bold text-xs">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10">
                                                <SelectItem value="any">Any Category</SelectItem>
                                                <SelectItem value="OBC">OBC</SelectItem>
                                                <SelectItem value="GENERAL">General</SelectItem>
                                                <SelectItem value="SC">SC</SelectItem>
                                                <SelectItem value="ST">ST</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2.5 pt-4 border-t border-white/5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Lifestyle</Label>
                                        <Select value={filters.occupation} onValueChange={(value) => handleFilterChange('occupation', value)}>
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl font-bold text-xs">
                                                <SelectValue placeholder="Occupation" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10">
                                                <SelectItem value="any">Any Profession</SelectItem>
                                                <SelectItem value="it">IT Professional</SelectItem>
                                                <SelectItem value="doctor">Medical / Doctor</SelectItem>
                                                <SelectItem value="business">Business</SelectItem>
                                                <SelectItem value="engineer">Engineer</SelectItem>
                                                <SelectItem value="teacher">Teacher</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={filters.education} onValueChange={(value) => handleFilterChange('education', value)}>
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl font-bold text-xs">
                                                <SelectValue placeholder="Education" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10">
                                                <SelectItem value="any">Any Level</SelectItem>
                                                <SelectItem value="bachelors">Graduate</SelectItem>
                                                <SelectItem value="masters">Post Graduate</SelectItem>
                                                <SelectItem value="phd">PhD</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={filters.district} onValueChange={(value) => handleFilterChange('district', value)}>
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl font-bold text-xs">
                                                <SelectValue placeholder="District" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10">
                                                <SelectItem value="any">Chhattisgarh (All)</SelectItem>
                                                <SelectItem value="raipur">Raipur</SelectItem>
                                                <SelectItem value="bilaspur">Bilaspur</SelectItem>
                                                <SelectItem value="durg">Durg</SelectItem>
                                                <SelectItem value="bhilai">Bhilai</SelectItem>
                                                <SelectItem value="korba">Korba</SelectItem>
                                                <SelectItem value="rajnandgaon">Rajnandgaon</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Additional Filters */}
                                    <div className="space-y-2.5 pt-4 border-t border-white/5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Preferences</Label>
                                        <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl font-bold text-xs">
                                                <SelectValue placeholder="Gender" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10">
                                                <SelectItem value="any">Any Gender</SelectItem>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={filters.maritalStatus} onValueChange={(value) => handleFilterChange('maritalStatus', value)}>
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl font-bold text-xs">
                                                <SelectValue placeholder="Marital Status" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10">
                                                <SelectItem value="any">Any Status</SelectItem>
                                                <SelectItem value="never-married">Never Married</SelectItem>
                                                <SelectItem value="divorced">Divorced</SelectItem>
                                                <SelectItem value="widowed">Widowed</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={filters.manglik} onValueChange={(value) => handleFilterChange('manglik', value)}>
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl font-bold text-xs">
                                                <SelectValue placeholder="Manglik" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10">
                                                <SelectItem value="any">Non-Specified</SelectItem>
                                                <SelectItem value="yes">Manglik</SelectItem>
                                                <SelectItem value="no">Non-Manglik</SelectItem>
                                                <SelectItem value="partial">Anshik Manglik</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={filters.diet} onValueChange={(value) => handleFilterChange('diet', value)}>
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl font-bold text-xs">
                                                <SelectValue placeholder="Diet" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10">
                                                <SelectItem value="any">Any Diet</SelectItem>
                                                <SelectItem value="vegetarian">Pure Veg</SelectItem>
                                                <SelectItem value="non-vegetarian">Non-Veg</SelectItem>
                                                <SelectItem value="eggetarian">Eggetarian</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={filters.speaksChhattisgarhi} onValueChange={(value) => handleFilterChange('speaksChhattisgarhi', value)}>
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl font-bold text-xs">
                                                <SelectValue placeholder="Language" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10">
                                                <SelectItem value="any">Any Language</SelectItem>
                                                <SelectItem value="yes">Speaks Chhattisgarhi</SelectItem>
                                                <SelectItem value="no">Only Hindi/Other</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {/* Occupation Filter */}
                                        <Select
                                            value={filters.occupation || "all"}
                                            onValueChange={(val) => handleFilterChange('occupation', val === 'all' ? '' : val)}
                                        >
                                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-xl text-xs font-bold focus:ring-primary/20">
                                                <SelectValue placeholder="Occupation" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10 max-h-[200px]">
                                                <SelectItem value="all">All Occupations</SelectItem>
                                                <SelectItem value="private">Private Sector</SelectItem>
                                                <SelectItem value="government">Government/PSU</SelectItem>
                                                <SelectItem value="business">Business/Self-Employed</SelectItem>
                                                <SelectItem value="defense">Defense/Police</SelectItem>
                                                <SelectItem value="medical">Medical/Healthcare</SelectItem>
                                                <SelectItem value="education">Education/Teaching</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            placeholder="Location/City..."
                                            className="h-10 bg-white/5 border-white/5 rounded-xl font-bold text-xs"
                                            value={filters.location}
                                            onChange={(e) => handleFilterChange('location', e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="ghost"
                                            onClick={clearFilters}
                                            className="h-10 w-10 p-0 rounded-xl hover:bg-white/5 text-muted-foreground border border-white/5"
                                            title="Clear all filters"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                        <Button onClick={() => refetch()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">
                                            Apply Filters
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Main Area */}
                <div className={`${showFilters ? 'lg:col-span-3 xl:col-span-4' : 'lg:col-span-4 xl:col-span-5'} space-y-6`}>
                    <div className="flex items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                {isLoading ? "Scanning Network..." : `${profiles.length} Matches Found`}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 hidden sm:block">Sort:</span>
                            <Select defaultValue="recent">
                                <SelectTrigger className="w-24 h-7 bg-transparent border-white/5 text-[9px] font-black uppercase tracking-widest focus:ring-0 rounded-lg">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111] border-white/10">
                                    <SelectItem value="recent" className="text-[10px] font-bold">Newest</SelectItem>
                                    <SelectItem value="active" className="text-[10px] font-bold">Active</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className={`grid gap-4 ${showFilters ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                [1,2,3,4,5,6].map(i => <div key={i} className="aspect-[4/5] bg-white/5 rounded-[1.5rem] animate-pulse border border-white/5" />)
                            ) : profiles.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full py-24 flex flex-col justify-center items-center text-muted-foreground"
                                >
                                    <div className="p-6 bg-white/5 rounded-full mb-4 border border-white/5">
                                        <SearchIcon className="w-10 h-10 opacity-30" />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">No profiles found</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Try adjusting your filters or location</p>
                                </motion.div>
                            ) : profiles.map((profile, i) => (
                                <motion.div
                                    key={profile.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                >
                                    <ProfileCard
                                        {...profile}
                                        name={formatProfileName(profile)}
                                        id={profile.id}
                                        media={profile.media}
                                        gender={profile.gender?.toLowerCase() as any}
                                        canChat={access?.isPremium}
                                        onActionSuccess={handleActionSuccess}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Infinite Pagination */}
                    {hasNextPage && (
                        <div className="flex flex-col items-center py-6 space-y-4">
                            <Button
                                variant="ghost"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="h-11 px-8 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary group transition-all w-full max-w-sm"
                            >
                                {isFetchingNextPage ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <>
                                        Expand Catalog
                                        <ChevronDown className="w-3.5 h-3.5 ml-2 group-hover:translate-y-1 transition-transform" />
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
