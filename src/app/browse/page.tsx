"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProfileCard } from "@/components/profile/profile-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Filter, Search, RefreshCw, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock profiles for the demonstration
const MOCK_PROFILES = [
  { id: 1, name: "Priya Sahu", age: 24, city: "Raipur", occupation: "Software Engineer", education: "B.Tech IT", gender: 'female' as const, isVerified: true },
  { id: 2, name: "Rahul Verma", age: 28, city: "Bilaspur", occupation: "Bank Manager", education: "MBA Finance", gender: 'male' as const, isVerified: true },
  { id: 3, name: "Sneha Patel", age: 25, city: "Durg", occupation: "Digital Marketer", education: "BBA", gender: 'female' as const, isVerified: false },
  { id: 4, name: "Amit Yadav", age: 27, city: "Raipur", occupation: "Business Owner", education: "Graduate", gender: 'male' as const, isVerified: true },
  { id: 5, name: "Anjali Singh", age: 23, city: "Korba", occupation: "Nurse", education: "B.Sc Nursing", gender: 'female' as const, isVerified: true },
  { id: 6, name: "Vikram Kurmi", age: 29, city: "Bhilai", occupation: "Civil Engineer", education: "M.Tech", gender: 'male' as const, isVerified: false },
  { id: 7, name: "Neha Dewangan", age: 26, city: "Raipur", occupation: "Teacher", education: "M.A. B.Ed", gender: 'female' as const, isVerified: true },
  { id: 8, name: "Sandeep Sahu", age: 30, city: "Dhamtari", occupation: "Agriculture Officer", education: "B.Sc Agriculture", gender: 'male' as const, isVerified: true },
];

export default function BrowsePage() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    const filtered = MOCK_PROFILES.filter(p => 
      p.name.toLowerCase().includes(val.toLowerCase()) || 
      p.city.toLowerCase().includes(val.toLowerCase()) ||
      p.occupation.toLowerCase().includes(val.toLowerCase())
    );
    setProfiles(filtered);
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
              className="text-4xl md:text-5xl font-black tracking-tighter text-foreground"
            >
              Browse <span className="text-primary italic">Matches</span>
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
                className={`rounded-full px-6 h-10 text-xs font-bold uppercase tracking-widest border border-white/5 transition-all
                  ${idx === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20 border-primary' : 'bg-card/40 hover:bg-white/5 text-muted-foreground hover:text-foreground'}
                `}
            >
                {tag}
            </Button>
          ))}
        </div>

        {/* Main Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
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
                  transition={{ delay: index * 0.05 }}
                >
                  <ProfileCard {...profile} />
                </motion.div>
              ))}
            </motion.div>
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
                  We couldn't find any profiles matching "{searchTerm}". Try broadening your search terms or adjusting filters.
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
