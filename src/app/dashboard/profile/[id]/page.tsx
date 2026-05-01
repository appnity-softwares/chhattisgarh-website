"use client";

import { useProfileDetails } from "@/hooks/use-profile-details";
import { useParams, useRouter } from "next/navigation";
import { usePhotoRequests } from "@/hooks/use-photo-requests";
import { Loader2, MapPin, Briefcase, GraduationCap, Heart, ShieldCheck, Share2, ChevronLeft, ChevronRight, User, Clock, Star, Info, Send, MessageSquare, X, Zap, Crown, Target, Users, Camera, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { usePartnerPreference } from "@/hooks/use-partner-preference";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import React, { useMemo, useState, useEffect, useCallback, MouseEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useUserAuthStore } from "@/stores/user-auth-store";
import { useUserAccess } from "@/hooks/use-user-access";
import { useInteractionStore } from "@/store/interaction-store";
import { motion, AnimatePresence } from "framer-motion";
import { displayValue, formatDateOfBirth, formatEnumLabel, formatProfileName, hasDisplayValue } from "@/lib/display-format";

export default function ProfileDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const profileUserId = parseInt(id);
  const router = useRouter();
  const { user: currentUser } = useUserAuthStore();
  const { data: profile, isLoading, error } = useProfileDetails(profileUserId);
  const { data: access } = useUserAccess();
  const { preference: myPref } = usePartnerPreference();
  const { send: sendPhoto } = usePhotoRequests();
  const isPhotoRequestPending = sendPhoto.isPending;
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const {
      relationships,
      setRelationship,
      sendInterest,
      acceptInterest,
      rejectInterest,
      toggleShortlist,
      syncFromApi
  } = useInteractionStore();

  const isOwnProfile = useMemo(() => {
    return currentUser?.id === profileUserId;
  }, [currentUser, profileUserId]);

  const isPremium = useMemo(() => access?.isPremium, [access]);

  const state = relationships[profileUserId] || { type: "none", isShortlisted: profile?.isShortlisted, isSuper: false, lastActionBy: null };

  const canChat = useMemo(() => {
    if (isOwnProfile) return false;
    return state.type === "matched" || isPremium;
  }, [isOwnProfile, state.type, isPremium]);

  // Sync with store on mount/update
  useEffect(() => {
    if (profile?.relationship) {
        syncFromApi(profileUserId, {
            ...profile.relationship,
            isShortlisted: profile.isShortlisted,
            isMatched: profile.relationship.status === 'accepted'
        });
    } else if (profile) {
        setRelationship(profileUserId, {
            isShortlisted: profile.isShortlisted,
            type: profile.isLiked ? "sent" : "none" // Basic fallback
        });
    }
  }, [profileUserId, profile, syncFromApi, setRelationship]);

  // Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const profileImages = useMemo(() => {
    if (!profile || !profile.media || profile.media.length === 0) {
      return [{ url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80", isPrivate: false }];
    }
    return profile.media.map(m => {
      const media = m as typeof m & { privacySettings?: { isPrivate?: boolean } };
      return {
      url: m.url,
      isPrivate: media.isPrivate || media.privacySettings?.isPrivate || false
    };
    });
  }, [profile]);

  const _hasPrivatePhotos = useMemo(() => profileImages.some(img => img.isPrivate), [profileImages]);
  const canSeePrivatePhotos = useMemo(() => isPremium || state.type === 'matched', [isPremium, state.type]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.firstName}'s Profile`,
        url: window.location.href,
      });
    }
  };

  const matchScoreData = useMemo(() => {
    if (!profile || !myPref) return null;

    // Logic for mock/calculated match score
    const scores = {
        age: 0,
        community: 0,
        location: 0,
        overall: 0
    };

    // Age Match
    if (myPref.ageFrom && myPref.ageTo && profile.age) {
        if (profile.age >= myPref.ageFrom && profile.age <= myPref.ageTo) scores.age = 100;
        else if (profile.age >= myPref.ageFrom - 2 && profile.age <= myPref.ageTo + 2) scores.age = 70;
        else scores.age = 40;
    } else scores.age = 80;

    // Community Match
    const myReligions = Array.isArray(myPref.religion) ? myPref.religion : [];
    if (myReligions.length > 0 && profile.religion) {
        if (myReligions.includes(profile.religion)) scores.community = 100;
        else scores.community = 20;
    } else scores.community = 90;

    // Location Match
    if (myPref.city && profile.city && myPref.city.toLowerCase() === profile.city.toLowerCase()) scores.location = 100;
    else if (myPref.state && profile.state && myPref.state.toLowerCase() === profile.state.toLowerCase()) scores.location = 80;
    else scores.location = 50;

    scores.overall = Math.round((scores.age * 0.4) + (scores.community * 0.4) + (scores.location * 0.2));

    return scores;
  }, [profile, myPref]);

  const actionConfig = useMemo(() => {
    interface ActionItem {
      label: string;
      action: () => void;
      disabled: boolean;
      pending: boolean;
      icon: React.ElementType;
      variant: "primary" | "secondary";
    }

    if (isOwnProfile) {
      return {
        label: "EDIT PROFILE",
        action: () => router.push("/dashboard/profile"),
        disabled: false,
        pending: false,
        icon: User,
        variant: "primary" as const
      } as ActionItem;
    }

    switch (state.type) {
      case "received":
        return {
          label: "ACCEPT INTEREST",
          action: () => acceptInterest(profileUserId, profile?.relationship?.matchId || 0),
          disabled: false,
          pending: false,
          icon: Heart,
          variant: "primary" as const
        } as ActionItem;
      case "sent":
        return {
          label: "INTEREST SENT",
          action: () => {},
          disabled: true,
          pending: false,
          icon: Clock,
          variant: "secondary" as const
        } as ActionItem;
      case "matched":
        return {
          label: "VIEW MESSAGES",
          action: () => router.push(`/dashboard/chat?userId=${profileUserId}`),
          disabled: false,
          pending: false,
          icon: MessageSquare,
          variant: "primary" as const
        } as ActionItem;
      case "rejected":
        return {
          label: "CONNECT AGAIN",
          action: () => sendInterest(profileUserId),
          disabled: false,
          pending: false,
          icon: Send,
          variant: "primary" as const
        } as ActionItem;
      default:
        // Premium can chat immediately
        if (canChat) {
            return {
                label: "SEND MESSAGE",
                action: () => router.push(`/dashboard/chat?userId=${profileUserId}`),
                disabled: false,
                pending: false,
                icon: MessageSquare,
                variant: "primary" as const
            } as ActionItem;
        }

        return {
          label: "CONNECT",
          action: () => sendInterest(profileUserId),
          disabled: false,
          pending: false,
          icon: Send,
          variant: "primary" as const
        } as ActionItem;
    }
  }, [isOwnProfile, state.type, router, profileUserId, acceptInterest, profile, sendInterest, canChat]);

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground font-bold">Failed to load profile details</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const _isShortlisted = profile?.isShortlisted;
  const profileName = formatProfileName(profile);
  const locationText = [profile.city, profile.state].map((value) => displayValue(value, "")).filter(Boolean).join(", ") || "Location not shared";
  const manglikValue = profile.horoscope?.manglik ?? profile.manglik;

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-fade-in">
      {/* Immersive Header Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-foreground/60 backdrop-blur-xl rounded-[2.5rem] border border-border sticky top-2 z-[60] shadow-2xl">
        <Button variant="ghost" onClick={() => router.back()} className="hover:bg-background text-muted-foreground hover:text-foreground rounded-full px-6 font-bold uppercase tracking-widest text-[10px] gap-2 transition-all active:scale-95">
          <ChevronLeft className="w-4 h-4" /> Back to Search
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-background h-11 w-11 border border-border transition-all active:scale-95" onClick={handleShare}>
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </Button>
          {!isOwnProfile && (
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-background h-11 w-11 border border-border transition-all active:scale-95" onClick={() => toggleShortlist(profileUserId)}>
              <Heart className={`w-4 h-4 ${state.isShortlisted ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        {/* Left Column: Media & Actions */}
        <div className="xl:col-span-5 space-y-6">
          <div className="relative aspect-[3.8/5] w-full rounded-[3.5rem] overflow-hidden shadow-4xl group border border-border">
             {/* Image Carousel */}
             <div className="h-full" ref={emblaRef}>
                <div className="flex h-full">
                   {profileImages.map((img, idx) => {
                     const isLocked = img.isPrivate && !canSeePrivatePhotos;
                     return (
                       <div className="relative flex-[0_0_100%] min-w-0" key={idx}>
                         <Image
                           src={img.url}
                           alt={profileName}
                           fill
                           priority
                           className={`object-cover transition-transform duration-1000 group-hover:scale-105 ${isLocked ? 'blur-2xl opacity-50 scale-125' : ''}`}
                         />
                         {isLocked && (
                           <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/60 backdrop-blur-sm z-10 transition-all group-hover:bg-background">
                             <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse border border-primary/30">
                               <Lock className="w-10 h-10 text-primary" />
                             </div>
                             <p className="text-foreground font-bold text-xl uppercase tracking-tighter mb-2 drop-shadow-lg">Photos Locked</p>
                             <p className="text-primary-foreground/80 text-xs font-bold uppercase tracking-widest px-10 text-center drop-shadow-md">Requires Match or Premium access</p>

                             {profile.allowPhotoRequest && (
                               <Button
                                 onClick={() => setShowPhotoModal(true)}
                                 className="mt-8 bg-primary text-white hover:bg-primary/90 font-bold px-8 py-6 rounded-2xl shadow-2xl shadow-primary/40 active:scale-95 transition-all text-xs uppercase tracking-widest gap-3"
                               >
                                 <Camera className="w-5 h-5" />
                                 Request Photo Access
                               </Button>
                             )}
                           </div>
                         )}
                       </div>
                     );
                   })}
                </div>
             </div>

             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-surface/70 pointer-events-none" />

             {/* Carousel Nav */}
             {profileImages.length > 1 && (
               <>
                <button onClick={() => emblaApi?.scrollPrev()} className="absolute top-1/2 left-6 -translate-y-1/2 w-12 h-12 bg-foreground/60 backdrop-blur-md rounded-full flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-primary z-20">
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button onClick={() => emblaApi?.scrollNext()} className="absolute top-1/2 right-6 -translate-y-1/2 w-12 h-12 bg-foreground/60 backdrop-blur-md rounded-full flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-primary z-20">
                  <ChevronRight className="w-7 h-7" />
                </button>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {scrollSnaps.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIndex ? 'w-8 bg-primary' : 'w-2 bg-background'}`} />
                  ))}
                </div>
               </>
             )}

             <div className="absolute top-8 left-8 flex flex-col gap-3 z-10">
               {profile.isVerified && (
                 <Badge className="bg-success/10 backdrop-blur-md text-foreground border-none py-2 px-4 rounded-full flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest shadow-2xl">
                   <ShieldCheck className="w-4 h-4" /> Verified Profile
                 </Badge>
               )}
               {profile.membership === 'PREMIUM' && (
                 <Badge className="bg-gold/20 backdrop-blur-md text-foreground border-none py-2 px-4 rounded-full flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest shadow-2xl">
                   <Crown className="w-4 h-4" /> Premium Member
                 </Badge>
               )}
             </div>

             {/* Bottom Info Overlay */}
             <div className="absolute bottom-10 left-10 right-10 text-foreground space-y-2">
                <h2 className="text-4xl font-bold uppercase tracking-tighter drop-shadow-2xl">
                  {profileName}{profile.age ? `, ${profile.age}` : ""}
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-primary-foreground/80 tracking-widest uppercase">
                  <MapPin className="w-4 h-4 text-primary" />
                  {locationText}
                </div>
             </div>
          </div>

          {/* Action Hub - Strictly Defined Behavior */}
          <div className="flex flex-col gap-4">
            {/* Main Primary Action */}
            <Button
                onClick={actionConfig.action}
                disabled={actionConfig.disabled || actionConfig.pending}
                className={`h-20 w-full rounded-[2rem] font-bold text-xl uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${actionConfig.variant === 'primary' ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20' : 'bg-background text-muted-foreground border border-border'}`}
            >
              {actionConfig.pending ? <Loader2 className="animate-spin w-6 h-6" /> : <><actionConfig.icon className="w-7 h-7 mr-4" /> {actionConfig.label}</>}
            </Button>

            <div className="flex gap-4">
              {/* Shortlist Action */}
              <Button
                onClick={() => toggleShortlist(profileUserId)}
                className={`h-16 flex-1 rounded-2xl font-bold text-xs uppercase tracking-widest gap-3 transition-all active:scale-95 ${state.isShortlisted ? 'bg-primary/20 text-primary border-primary/30' : 'bg-background border border-border text-muted-foreground hover:bg-background'}`}
              >
                <Heart className={`w-5 h-5 ${state.isShortlisted ? 'fill-current' : ''}`} />
                {state.isShortlisted ? "Shortlisted" : "Shortlist"}
              </Button>


              {/* Reject/Skip for Received state */}
              {state.type === "received" && (
                <Button
                  variant="outline"
                  className="h-16 flex-1 rounded-2xl border-border bg-background text-muted-foreground hover:bg-error/10 hover:text-error transition-all active:scale-95"
                  onClick={() => rejectInterest(profileUserId, profile?.relationship?.matchId ?? undefined)}
                >
                  <X className="w-6 h-6 mr-2" /> Reject
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info Tabs */}
        <div className="xl:col-span-7 space-y-10">
          <div className="space-y-4">
             <div className="flex items-center gap-4 text-primary font-bold uppercase tracking-[0.4em] text-[10px] font-medium">
               <div className="h-0.5 w-12 bg-primary rounded-full shadow-lg shadow-primary/50" /> Profile Discovery
             </div>
             <h1 className="text-6xl font-bold tracking-tighter uppercase leading-none">
	               {displayValue(profile.firstName, "Profile")} <span className="text-primary font-medium">{displayValue(profile.lastName, "")}</span>
             </h1>
          </div>

          {/* Match Score Card */}
          {matchScoreData && !isOwnProfile && (
              <Card className="bg-surface border-primary/20 p-8 rounded-[3rem] shadow-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Target className="w-40 h-40 text-primary rotate-12" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                      {/* Circular Match Score Indicator */}
                      <div className="relative flex flex-col items-center justify-center h-40 w-40 shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-foreground/5" />
                              <circle
                                cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                                strokeDasharray={440}
                                strokeDashoffset={440 - (440 * matchScoreData.overall) / 100}
                                strokeLinecap="round"
                                className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] transition-all duration-1000 ease-out"
                              />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-4xl font-bold">{matchScoreData.overall}%</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Match</span>
                          </div>
                      </div>

                      <div className="flex-1 space-y-6 w-full">
                          <div className="space-y-1">
                              <h4 className="text-xl font-bold uppercase font-medium tracking-tight">Compatibility Score</h4>
                              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Calculated based on your partner preferences</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                  <div className="flex justify-between items-center px-1">
                                      <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3 text-primary" /> Age</span>
                                      <span className="text-[10px] font-bold">{matchScoreData.age}%</span>
                                  </div>
                                  <Progress value={matchScoreData.age} className="h-1.5 bg-background" indicatorClassName="bg-primary/10" />
                              </div>
                              <div className="space-y-2">
                                  <div className="flex justify-between items-center px-1">
                                      <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"><Users className="w-3 h-3 text-error" /> Community</span>
                                      <span className="text-[10px] font-bold">{matchScoreData.community}%</span>
                                  </div>
                                  <Progress value={matchScoreData.community} className="h-1.5 bg-background" indicatorClassName="bg-error/10" />
                              </div>
                              <div className="space-y-2">
                                  <div className="flex justify-between items-center px-1">
                                      <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primaryDark" /> Location</span>
                                      <span className="text-[10px] font-bold">{matchScoreData.location}%</span>
                                  </div>
                                  <Progress value={matchScoreData.location} className="h-1.5 bg-background" indicatorClassName="bg-gold/20" />
                              </div>
                          </div>
                      </div>
                  </div>
              </Card>
          )}

          <Tabs defaultValue="about" className="space-y-8">
            <TabsList className="bg-background p-1.5 rounded-3xl border border-border flex w-full">
              <TabsTrigger value="about" className="flex-1 rounded-2xl py-3 font-bold text-[10px] uppercase tracking-[0.15em] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">About</TabsTrigger>
              <TabsTrigger value="details" className="flex-1 rounded-2xl py-3 font-bold text-[10px] uppercase tracking-[0.15em] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">My Background</TabsTrigger>
              <TabsTrigger value="profession" className="flex-1 rounded-2xl py-3 font-bold text-[10px] uppercase tracking-[0.15em] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">Work & Stats</TabsTrigger>
              <TabsTrigger value="life" className="flex-1 rounded-2xl py-3 font-bold text-[10px] uppercase tracking-[0.15em] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">Lifestyle</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="bg-background border-border p-10 rounded-[3rem] shadow-2xl group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-10 w-1 bg-primary rounded-full" />
                  <h3 className="text-xl font-bold uppercase tracking-tight font-medium">Personal Story</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium font-medium">
                  &quot;{displayValue(profile.about, "This member hasn't shared their story yet. Connect with them to learn more about their journey and aspirations.")}&quot;
                </p>
              </Card>

              {(hasDisplayValue(profile.gender) || hasDisplayValue(profile.maritalStatus)) && (
                <div className="grid grid-cols-2 gap-4">
                  {hasDisplayValue(profile.gender) && (
                    <Card className="bg-background border-border p-6 rounded-3xl space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Gender</p>
                      <p className="text-sm font-bold uppercase">{formatEnumLabel(profile.gender)}</p>
                    </Card>
                  )}
                  {hasDisplayValue(profile.maritalStatus) && (
                    <Card className="bg-background border-border p-6 rounded-3xl space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Relationship</p>
                      <p className="text-sm font-bold uppercase">{formatEnumLabel(profile.maritalStatus)}</p>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <DetailSection icon={Heart} title="Birth Details">
                   <DetailItem label="Date of Birth" value={formatDateOfBirth(profile.dateOfBirth ?? profile.dob)} />
                   <DetailItem label="Time" value={profile.horoscope?.birthTime} />
                   <DetailItem label="Place" value={profile.horoscope?.birthPlace} />
                   <DetailItem label="Manglik" value={manglikValue === undefined ? undefined : manglikValue ? "Yes" : "No"} />
                 </DetailSection>

                 <DetailSection icon={User} title="Cultural Background">
                   <DetailItem label="Religion" value={formatEnumLabel(profile.religion)} />
                   <DetailItem label="Caste" value={formatEnumLabel(profile.caste)} />
                   <DetailItem label="Gothra" value={profile.horoscope?.gothra} />
                   <DetailItem label="Mother Tongue" value={formatEnumLabel(profile.motherTongue)} />
                 </DetailSection>

                 <DetailSection icon={Star} title="Family Details">
                   <DetailItem label="Father" value={profile.family?.fatherOccupation ?? profile.fatherOccupation} />
                   <DetailItem label="Mother" value={profile.family?.motherOccupation ?? profile.motherOccupation} />
                   <DetailItem label="Structure" value={formatEnumLabel(profile.family?.familyType ?? profile.familyType)} />
                   <DetailItem label="Status" value={formatEnumLabel(profile.family?.familyStatus ?? profile.familyStatus)} />
                   <DetailItem label="Values" value={formatEnumLabel(profile.family?.familyValues ?? profile.familyValues)} />
                 </DetailSection>
               </div>
            </TabsContent>

            <TabsContent value="profession" className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <DetailSection icon={Briefcase} title="Professional Life">
                   <DetailItem label="Occupation" value={profile.occupation} />
                   <DetailItem label="Organization" value={profile.organization} />
                   <DetailItem label="Annual Income" value={profile.income ?? profile.annualIncome} />
                 </DetailSection>

                 <DetailSection icon={GraduationCap} title="Education">
                   <DetailItem label="Degree" value={profile.education ?? profile.highestEducation} />
                   <DetailItem label="Specialization" value={profile.specialization ?? profile.educationDetails} />
                   <DetailItem label="University" value={profile.college} />
                 </DetailSection>

                 <DetailSection icon={Info} title="Physical Stats">
                   <DetailItem label="Height" value={profile.height ? `${profile.height} cm` : undefined} />
                   <DetailItem label="Weight" value={profile.weight ? `${profile.weight} kg` : undefined} />
                   <DetailItem label="Body Type" value={formatEnumLabel(profile.lifestyle?.bodyType)} />
                 </DetailSection>
               </div>
            </TabsContent>

            <TabsContent value="life" className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <DetailSection icon={Zap} title="Lifestyle Habits">
                   <DetailItem label="Diet" value={formatEnumLabel(profile.lifestyle?.diet ?? profile.diet)} />
                   <DetailItem label="Smoking" value={formatEnumLabel(profile.lifestyle?.smoking ?? profile.smokingHabit)} />
                   <DetailItem label="Drinking" value={formatEnumLabel(profile.lifestyle?.drinking ?? profile.drinkingHabit)} />
                 </DetailSection>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Photo Request Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={() => setShowPhotoModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e: MouseEvent) => e.stopPropagation()}
              className="bg-surface border border-border rounded-[2.5rem] p-10 w-full max-w-md space-y-8 shadow-4xl relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-10 opacity-5">
                 <Camera className="w-40 h-40 text-primary rotate-12" />
               </div>

               <div className="relative z-10 space-y-2">
                 <h2 className="text-3xl font-bold text-foreground uppercase tracking-tighter font-medium">Photo <span className="text-primary">Request</span></h2>
                 <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Connect with {profile.firstName} to see their photos</p>
               </div>

               <div className="relative z-10 space-y-6">
                   <div className="space-y-3">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Personal Message (Optional)</label>
                     <textarea
                         placeholder="Hi, I'm interested in your profile and would love to see more photos..."
                         className="w-full bg-background border border-border rounded-2xl p-5 text-sm font-medium text-foreground min-h-[120px] outline-none focus:border-primary/50 transition-all resize-none shadow-inner"
                         id="photo-request-msg"
                     />
                   </div>

                   <div className="flex gap-4">
                     <Button variant="ghost" className="flex-1 rounded-2xl text-[10px] font-bold uppercase tracking-widest h-14 hover:bg-background" onClick={() => setShowPhotoModal(false)}>Nevermind</Button>
                     <Button
                         className="flex-1 rounded-2xl text-[10px] font-bold uppercase tracking-widest h-14 bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20"
                         onClick={() => {
                             const msg = (document.getElementById('photo-request-msg') as HTMLTextAreaElement)?.value;
                             sendPhoto.mutate({
                                 photoId: profile.media?.[0]?.id || 1,
                                 message: msg || "I'd like to see your photos"
                             });
                             setShowPhotoModal(false);
                         }}
                         disabled={isPhotoRequestPending}
                     >
                       {isPhotoRequestPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 mr-2" /> SEND REQUEST</>}
                     </Button>
                   </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailSection({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) {
  const visibleChildren = React.Children.toArray(children).filter((child) => {
    if (!React.isValidElement<{ value?: unknown }>(child)) return Boolean(child);
    return hasDisplayValue(child.props.value);
  });

  if (visibleChildren.length === 0) return null;

  return (
    <Card className="bg-background border-border p-8 rounded-[2.5rem] shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest">{title}</h3>
      </div>
      <div className="space-y-4">
        {visibleChildren}
      </div>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string, value: unknown }) {
  if (!hasDisplayValue(value)) return null;

  return (
    <div className="flex justify-between items-center group font-medium">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className="text-[13px] text-foreground font-bold tracking-tight">{displayValue(value)}</span>
    </div>
  );
}
