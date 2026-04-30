'use client';

import React from 'react';
import { 
  User, MapPin, Calendar, Heart, Briefcase, GraduationCap, 
  Languages, Eye, AlertCircle, CheckCircle2, X, Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CompletenessResult } from "@/utils/profile-validation";
import { calculateAge, displayValue, formatDateOfBirth, formatProfileName } from "@/lib/display-format";

interface ProfilePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  completeness: CompletenessResult;
}

export const ProfilePreviewDialog: React.FC<ProfilePreviewDialogProps> = ({ isOpen, onClose, data, completeness }) => {
  if (!isOpen) return null;

  const InfoItem = ({ icon: Icon, label, value, isMissing }: { icon: any, label: string, value: string | number | undefined, isMissing?: boolean }) => (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border",
      isMissing ? "bg-rose-500/5 border-rose-500/20" : "bg-white/5 border-white/10"
    )}>
      <div className={cn("mt-1 p-1.5 rounded-md", isMissing ? "bg-rose-500/20" : "bg-primary/10")}>
        <Icon className={cn("w-3.5 h-3.5", isMissing ? "text-rose-400" : "text-primary")} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-semibold", isMissing ? "text-rose-400 font-bold italic" : "text-white")}>
          {isMissing ? "-" : displayValue(value)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Banner */}
        <div className="bg-primary/20 border-b border-primary/20 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-primary" />
            <div>
               <p className="text-xs font-black uppercase tracking-widest text-white">Preview Mode</p>
               <p className="text-[10px] font-bold text-primary italic">This is how the profile will appear in the application</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Hero Section Mock */}
          <div className="relative h-80 w-full bg-neutral-900 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-40 h-40 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                  <User className="w-20 h-20 text-primary/40" />
               </div>
            </div>
            
            <div className="absolute bottom-8 left-8 z-20 space-y-2">
               <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-black text-white tracking-tight">
                    {formatProfileName(data)}{calculateAge(data.dateOfBirth) ? `, ${calculateAge(data.dateOfBirth)}` : ''}
                  </h2>
                  {data.isVerified && <CheckCircle2 className="w-6 h-6 text-primary fill-primary/20" />}
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-bold uppercase text-xs">
                    <MapPin className="w-4 h-4 text-emerald-400" /> {[data.city, data.state].map((value) => displayValue(value, "")).filter(Boolean).join(", ") || "-"}
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30 font-black uppercase text-[10px] tracking-tighter">
                    {data.maritalStatus?.replace('_', ' ')}
                  </Badge>
               </div>
            </div>

            {/* Photo Counter Mock */}
            <div className="absolute bottom-8 right-8 z-20 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
               <Heart className="w-3.5 h-3.5 text-rose-400" />
               <span className="text-xs font-black text-white">{completeness.total}% Match Potential</span>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-neutral-200">
            {/* Left Col: Main Info */}
            <div className="md:col-span-2 space-y-8">
               
               {/* About */}
               <section className="space-y-4">
                  <div className="flex items-center gap-2 border-l-4 border-primary pl-3">
                     <h3 className="text-lg font-black uppercase tracking-tight">About Me</h3>
                  </div>
                  <div className={cn(
                    "p-6 rounded-2xl border leading-relaxed",
                    !data.bio ? "bg-rose-500/5 border-rose-500/20 italic text-rose-400" : "bg-white/5 border-white/10"
                  )}>
                    {data.bio || "No biography provided by the user. A detailed bio helps in better matchmaking."}
                  </div>
               </section>

               {/* Personal Details Grid */}
               <section className="space-y-4">
                  <div className="flex items-center gap-2 border-l-4 border-amber-400 pl-3">
                     <h3 className="text-lg font-black uppercase tracking-tight">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <InfoItem icon={Calendar} label="Date of Birth" value={formatDateOfBirth(data.dateOfBirth)} isMissing={!data.dateOfBirth} />
                     <InfoItem icon={User} label="Religion / Community" value={data.religion} isMissing={!data.religion} />
                     <InfoItem icon={GraduationCap} label="Caste" value={data.caste} isMissing={!data.caste} />
                     <InfoItem icon={Languages} label="Mother Tongue" value={data.motherTongue} isMissing={!data.motherTongue} />
                     <InfoItem icon={Activity} label="Height (cm)" value={data.height} isMissing={!data.height} />
                  </div>
               </section>

               {/* Career */}
               <section className="space-y-4">
                  <div className="flex items-center gap-2 border-l-4 border-blue-400 pl-3">
                     <h3 className="text-lg font-black uppercase tracking-tight">Education & Profession</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <InfoItem icon={GraduationCap} label="Education" value={data.education} isMissing={!data.education} />
                     <InfoItem icon={Briefcase} label="Occupation" value={data.occupation} isMissing={!data.occupation} />
                  </div>
               </section>
            </div>

            {/* Right Col: Sidebar info */}
            <div className="space-y-6">
               <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
                  <div className="flex items-center gap-2">
                     <AlertCircle className="w-5 h-5 text-primary" />
                     <h4 className="text-sm font-black uppercase tracking-wider">Missing Highlights</h4>
                  </div>
                  <div className="space-y-3">
                     {Object.entries(completeness.sections).filter(([_, s]) => !s.isComplete).map(([key, section]) => (
                        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                           <span className="text-[10px] font-bold uppercase text-muted-foreground">{section.title}</span>
                           <span className="text-[10px] font-black text-rose-400">{section.percent}%</span>
                        </div>
                     ))}
                     {completeness.total === 100 && (
                        <p className="text-xs text-emerald-400 font-bold italic">No missing sections found. Profile is 100% complete!</p>
                     )}
                  </div>
               </div>

               <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-wider">Preview Note</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    This view simulates the public appearance of the profile. Private information such as email and contact numbers are hidden by default in this view.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-neutral-900 border-t border-white/10 flex justify-end">
           <button 
             onClick={onClose}
             className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-white/90 transition-all active:scale-95 shadow-xl"
           >
             Continue Editing
           </button>
        </div>
      </div>
    </div>
  );
};

const Activity = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
