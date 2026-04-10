"use client";

import Image from "next/image";
import { MapPin, Briefcase, GraduationCap, ShieldCheck, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ProfileCardProps {
    name: string;
    age: number;
    city: string;
    occupation: string;
    education?: string;
    image?: string;
    isVerified?: boolean;
    gender: 'male' | 'female';
}

export function ProfileCard({ name, age, city, occupation, education, image, isVerified, gender }: ProfileCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="overflow-hidden border-white/5 bg-card/40 backdrop-blur-md rounded-[2rem] group h-full shadow-xl hover:shadow-primary/5 transition-all">
                <div className="relative h-72 w-full overflow-hidden">
                    <Image
                        src={image || (gender === 'female' ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80" : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80")}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {isVerified && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                            </Badge>
                        )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black tracking-tight">{name}, {age}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium mt-1">
                                    <MapPin className="w-3 h-3 text-primary" />
                                    {city}
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
                                <Heart className="w-5 h-5 text-primary group-hover:fill-primary transition-all cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span className="truncate">{occupation}</span>
                        </div>
                        {education && (
                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                <GraduationCap className="w-4 h-4 text-primary" />
                                <span className="truncate">{education}</span>
                            </div>
                        )}
                    </div>

                    <Button variant="outline" className="w-full border-primary/20 hover:border-primary hover:bg-primary/5 text-primary font-bold rounded-xl transition-all group/btn">
                        View Details
                        <motion.span
                            initial={{ x: 0 }}
                            whileHover={{ x: 4 }}
                            className="ml-2 inline-block"
                        >
                            →
                        </motion.span>
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
