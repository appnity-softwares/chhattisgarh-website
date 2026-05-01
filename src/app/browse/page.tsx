"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProfileCard } from "@/components/profile/profile-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, SlidersHorizontal, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useInfiniteProfiles } from "@/hooks/use-infinite-profiles";
import { formatProfileName } from "@/lib/display-format";

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState("");


  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteProfiles({
    search: searchTerm,
    type: 'discovery'
  });

  const profiles = data?.pages.flatMap(page => page.profiles) || [];

  const handleSearch = (val: string) => {
    setSearchTerm(val);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground"
            >
              Browse <span className="text-primary font-medium">Matches</span>
            </motion.h1>
            <p className="text-muted-foreground font-light text-lg">
              Showing {profiles.length} potential partners from Chhattisgarh
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl border-white/10 bg-card/40 backdrop-blur-md h-12 gap-2 font-bold px-6">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              Filters
            </Button>
            <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, city..." 
                  className="pl-12 h-12 bg-card/40 border-white/10 rounded-xl focus:ring-primary/20 transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
          </div>
        </div>

        {/* Quick Filter Pill Bar */}
        <div className="flex overflow-x-auto pb-8 gap-3 no-scrollbar scroll-smooth">
          {["All", "Near Me", "Verified Only", "Raipur", "Bilaspur", "Sahu", "Patel", "Kurmi"].map((tag, idx) => (
            <Button 
                key={idx}
                variant="ghost" 
                className={`rounded-full px-6 h-10 text-xs font-bold uppercase tracking-widest border transition-all
                  ${idx === 0 ? 'bg-primary text-white shadow-md border-primary' : 'bg-surface border-border hover:bg-muted text-muted-foreground hover:text-foreground'}
                `}
            >
                {tag}
            </Button>
          ))}
        </div>

        {/* Main Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[450px] bg-card/20 rounded-[2rem] animate-pulse border border-white/5" />
              ))}
            </motion.div>
          ) : profiles.length > 0 ? (
            <div className="space-y-12">
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {profiles.map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index % 12) * 0.05 }}
                  >
                    <ProfileCard 
                      {...profile}
                      id={profile.id}
                      name={formatProfileName(profile)}
                      gender={profile.gender?.toLowerCase() as any}
                      media={profile.media}
                      relationship={profile.relationship}
                      onActionSuccess={() => {}}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {hasNextPage && (
                <div className="flex justify-center pt-8">
                  <Button 
                    onClick={() => fetchNextPage()} 
                    disabled={isFetchingNextPage}
                    variant="outline"
                    className="rounded-2xl h-14 px-10 border-border bg-surface hover:bg-muted font-bold tracking-widest uppercase gap-2 shadow-md"
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Load More Profiles <RefreshCw className="w-4 h-4" /></>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-32 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-24 h-24 bg-card/50 rounded-full flex items-center justify-center border border-white/5">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="max-w-md">
                <h3 className="text-2xl font-bold text-foreground mb-2">No matches found</h3>
                <p className="text-muted-foreground font-light">
                  We couldn&apos;t find any profiles matching &ldquo;{searchTerm}&rdquo;. Try broadening your search terms or adjusting filters.
                </p>
              </div>
              <Button 
                onClick={() => handleSearch("")}
                variant="outline" 
                className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold"
              >
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
