"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  Crown,
  GraduationCap,
  Heart,
  Info,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  ShieldCheck,
  Star,
  Users,
  Briefcase,
  X,
  CheckCircle2,
  LucideIcon
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfileDetails } from "@/hooks/use-profile-details";
import { useInteractions } from "@/hooks/use-interactions";
import { useProfileContact } from "@/hooks/use-profile-contact";
import { useRelationship } from "@/hooks/use-relationship";
import { useUserAccess } from "@/hooks/use-user-access";
import premiumWebService from "@/services/premium-web.service";
import { useUserAuthStore } from "@/stores/user-auth-store";

const enumLabel = (value?: string | null) =>
  value ? value.replace(/_/g, " ") : "Not shared";

export default function ProfileDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const profileUserId = Number(id);
  const { user, accessToken } = useUserAuthStore();
  const { data: access } = useUserAccess();
  const { data: profile, isLoading } = useProfileDetails(profileUserId);
  const relationshipQuery = useRelationship(Number.isFinite(profileUserId) ? profileUserId : null);
  const { sendInterest, acceptInterest, rejectInterest, toggleShortlist } = useInteractions();
  const [activeTab, setActiveTab] = useState("about");
  const [showHoroscope, setShowHoroscope] = useState(false);
  const [loadContactInfo, setLoadContactInfo] = useState(false);

  const isOwnProfile = profile?.userId === user?.id;
  const relationship = isOwnProfile ? null : relationshipQuery.data;

  const { data: contactAccess, isLoading: contactLoading } = useProfileContact(
    !isOwnProfile && Number.isFinite(profileUserId) ? profileUserId : null,
    loadContactInfo && !isOwnProfile
  );

  const { data: horoscope, isFetching: horoscopeLoading } = useQuery({
    queryKey: ["horoscope", profileUserId],
    queryFn: async () => {
      const res = await premiumWebService.matchHoroscope(profileUserId, accessToken as string);
      return res.data;
    },
    enabled: showHoroscope && !!accessToken && Number.isFinite(profileUserId) && !isOwnProfile,
  });

  const mainImage = useMemo(() => {
    if (!profile) return "";
    return (
      profile.media?.find((media) => media.isProfile)?.url ||
      profile.media?.[0]?.url ||
      (profile.gender === "FEMALE"
        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80"
        : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80")
    );
  }, [profile]);

  const actionConfig = useMemo(() => {
    if (isOwnProfile) {
      return {
        label: "EDIT PROFILE",
        action: () => router.push("/dashboard/profile"),
        disabled: false,
        pending: false,
      };
    }

    switch (relationship?.status) {
      case "received":
        return {
          label: "ACCEPT INTEREST",
          action: () => relationship?.matchId && acceptInterest.mutate(relationship.matchId),
          disabled: !relationship?.matchId,
          pending: acceptInterest.isPending,
        };
      case "sent":
        return {
          label: "INTEREST SENT",
          action: () => undefined,
          disabled: true,
          pending: false,
        };
      case "accepted":
        return {
          label: "MATCHED",
          action: () => router.push(`/dashboard/chat/${profileUserId}`),
          disabled: false,
          pending: false,
        };
      case "blocked":
        return {
          label: "BLOCKED",
          action: () => undefined,
          disabled: true,
          pending: false,
        };
      default:
        return {
          label: "SEND INTEREST",
          action: () => sendInterest.mutate(profileUserId),
          disabled: false,
          pending: sendInterest.isPending,
        };
    }
  }, [acceptInterest, isOwnProfile, profileUserId, relationship, router, sendInterest]);

  const canChat = isOwnProfile || relationship?.canChat;
  const contactAllowed = isOwnProfile || contactAccess?.allowed;
  const contactMessage =
    contactAccess?.message ||
    (relationship?.canViewContacts
      ? "Reveal contact details. Backend limits will still apply."
      : "Contact details unlock after a mutual match or with premium access.");

  const handleShare = async () => {
    if (!profile) return;

    const shareUrl = `${window.location.origin}/dashboard/profile/${profile.userId}`;
    if (navigator.share) {
      await navigator.share({
        title: `${profile.firstName} ${profile.lastName}`,
        text: `View ${profile.firstName}'s profile on Chhattisgarh Shaadi`,
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
  };

  const handleChat = () => {
    if (canChat) {
      router.push(`/dashboard/chat/${profileUserId}`);
      return;
    }

    router.push("/dashboard/membership");
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black tracking-widest uppercase italic animate-pulse">
          Loading Profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-6">
        <h1 className="text-4xl font-black uppercase text-foreground">Profile Not Found</h1>
        <Button onClick={() => router.back()} className="rounded-full px-8">
          GO BACK
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-12">
      <div className="flex items-center justify-between px-2">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-full px-4 font-black uppercase tracking-widest text-xs gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={handleShare}>
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </Button>
          {!isOwnProfile && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10"
              onClick={() => toggleShortlist.mutate(profileUserId)}
            >
              <Heart className={`w-4 h-4 ${toggleShortlist.isPending ? "animate-pulse" : "text-primary"}`} />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[600px] w-full rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/10 group"
          >
            <Image
              src={mainImage}
              alt={profile.firstName}
              fill
              priority
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute bottom-8 left-8 right-8 text-white space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {profile.isVerified && (
                  <Badge className="bg-green-500 text-white font-black px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">
                    Verified Member
                  </Badge>
                )}
                <Badge className="bg-primary/80 backdrop-blur-md text-white font-black px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">
                  {profile.profileCompleteness}% Complete
                </Badge>
                {access?.planName && (
                  <Badge className="bg-black/40 border border-white/10 text-white font-black px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">
                    {access.planName}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight">
                {profile.firstName} <br />
                <span className="text-primary italic">{profile.lastName}</span>, {profile.age}
              </h1>
              <div className="flex items-center gap-2 text-white/80 font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                {profile.city}, {profile.state}
              </div>
            </div>
          </motion.div>

          <div className="flex gap-4 p-2 bg-card/20 backdrop-blur-xl rounded-[2.5rem] border border-white/5 flex-wrap">
            <Button
              onClick={actionConfig.action}
              disabled={actionConfig.disabled || actionConfig.pending}
              className="flex-1 min-w-[220px] h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-[2rem] shadow-xl shadow-primary/20 group"
            >
              {actionConfig.pending ? <Loader2 className="animate-spin" /> : actionConfig.label}
              {!actionConfig.pending && <Heart className="w-6 h-6 ml-2 group-hover:fill-white" />}
            </Button>

            {!isOwnProfile && relationship?.status === "received" && relationship?.matchId && (
              <Button
                variant="outline"
                onClick={() => rejectInterest.mutate(relationship.matchId as number)}
                disabled={rejectInterest.isPending}
                className="h-16 px-6 rounded-[2rem] border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-black"
              >
                {rejectInterest.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
              </Button>
            )}

            {!isOwnProfile && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleChat}
                className={`h-16 w-16 rounded-[2rem] ${
                  canChat
                    ? "bg-white/5 border-white/10 hover:bg-white/10 text-primary"
                    : "bg-white/5 border-white/5 text-muted-foreground"
                }`}
              >
                {canChat ? <MessageSquare className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </Button>
            )}
          </div>

          {!isOwnProfile && relationship && (
            <Card className="bg-card/30 border-white/5 rounded-[2rem]">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">
                      Relationship Status
                    </p>
                    <p className="text-xl font-black text-foreground">
                      {relationship.status === "accepted"
                        ? "Matched"
                        : relationship.status === "received"
                          ? "Interest Received"
                          : relationship.status === "sent"
                            ? "Interest Sent"
                            : relationship.status === "blocked"
                              ? "Blocked"
                              : "No Interaction"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">
                      Chat
                    </p>
                    <p className={`text-sm font-black ${canChat ? "text-green-500" : "text-amber-400"}`}>
                      {canChat ? "Allowed" : enumLabel(relationship.reason)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-7 space-y-10">
          <div className="flex items-center gap-8 border-b border-white/5 overflow-x-auto no-scrollbar">
            {["about", "personal", "family", "lifestyle"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${
                  activeTab === tab ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              {activeTab === "about" && (
                <div className="space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                      <Info className="w-6 h-6 text-primary" />
                      Biographical <span className="text-primary italic">Note</span>
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed font-light italic">
                      &quot;{profile.bio || `I am a ${profile.occupation || "professional"} from ${profile.city}, looking for a compatible partner.`}&quot;
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <HighlightCard icon={Briefcase} label="Professional" value={profile.occupation || "Not shared"} />
                    <HighlightCard icon={GraduationCap} label="Academic" value={profile.education || "Not shared"} />
                    <HighlightCard icon={Calendar} label="Marital Status" value={enumLabel(profile.maritalStatus)} />
                    <HighlightCard
                      icon={Users}
                      label="Religion / Caste"
                      value={`${enumLabel(profile.religion)}${profile.caste ? `, ${profile.caste}` : ""}`}
                    />
                  </div>
                </div>
              )}

              {activeTab === "personal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailItem label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
                  <DetailItem label="Age" value={`${profile.age} Years`} />
                  <DetailItem label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not shared"} />
                  <DetailItem label="Height" value={profile.height ? `${profile.height} cm` : "Not shared"} />
                  <DetailItem label="Mother Tongue" value={enumLabel(profile.motherTongue)} />
                  <DetailItem label="Location" value={`${profile.city}, ${profile.state}`} />
                  <DetailItem label="Gender" value={enumLabel(profile.gender)} />
                  <DetailItem label="Manglik" value={profile.manglik ? "Yes" : "No"} isLocked={profile.manglik === undefined} />
                </div>
              )}

              {activeTab === "family" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailItem label="Family Status" value={profile.familyStatus || "Not shared"} />
                  <DetailItem label="Family Type" value={profile.familyType || "Not shared"} />
                  <DetailItem label="Family Values" value={profile.familyValues || "Not shared"} />
                  <DetailItem label="Father's Occupation" value={profile.fatherOccupation || "Not shared"} />
                  <DetailItem label="Mother's Occupation" value={profile.motherOccupation || "Not shared"} />
                  <DetailItem label="Brothers" value={String(profile.numberOfBrothers ?? 0)} />
                  <DetailItem label="Sisters" value={String(profile.numberOfSisters ?? 0)} />
                </div>
              )}

              {activeTab === "lifestyle" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailItem label="Diet" value={enumLabel(profile.diet)} />
                  <DetailItem label="Smoking" value={enumLabel(profile.smokingHabit)} />
                  <DetailItem label="Drinking" value={enumLabel(profile.drinkingHabit)} />
                  <DetailItem label="Native Village" value={profile.nativeVillage || "Not shared"} />
                  <DetailItem label="Speaks Chhattisgarhi" value={profile.speaksChhattisgarhi ? "Yes" : "No"} />
                  <DetailItem label="Annual Income" value={profile.annualIncome || "Not shared"} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {!isOwnProfile && (
            <Card className="bg-card/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-widest text-foreground">
                        Contact Access
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">
                        Backend controlled visibility
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setLoadContactInfo(true)}
                    disabled={loadContactInfo || contactLoading}
                    className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest"
                  >
                    {contactLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reveal Contact"}
                  </Button>
                </div>

                {contactAllowed ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ContactCard
                      icon={Phone}
                      label="Phone"
                      value={contactAccess?.contactInfo?.phone || "Not shared"}
                    />
                    <ContactCard
                      icon={Mail}
                      label="Email"
                      value={contactAccess?.contactInfo?.email || "Not shared"}
                    />
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{contactMessage}</p>
                    <div className="flex gap-3 flex-wrap">
                      {!relationship?.canViewContacts && (
                        <Button
                          variant="outline"
                          className="rounded-xl border-white/10 bg-white/5"
                          onClick={() => router.push("/dashboard/membership")}
                        >
                          Upgrade Access
                        </Button>
                      )}
                      {relationship?.status !== "accepted" && relationship?.status !== "sent" && (
                        <Button
                          className="rounded-xl bg-primary hover:bg-primary/90"
                          onClick={() => sendInterest.mutate(profileUserId)}
                        >
                          Send Interest First
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-card/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500/30" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-widest text-foreground">
                      Horoscope <span className="text-amber-500">Matching</span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">
                      Calculate Gun Milan (Ashtakoot)
                    </p>
                  </div>
                </div>
                {!horoscope && !isOwnProfile && (
                  <Button
                    onClick={() => setShowHoroscope(true)}
                    disabled={horoscopeLoading}
                    className="h-10 px-6 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20"
                  >
                    {horoscopeLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Star className="w-3 h-3 mr-2" />}
                    CHECK NOW
                  </Button>
                )}
              </div>

              {horoscope && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 space-y-6"
                >
                  <div className="flex items-center justify-center gap-10">
                    <div className="text-center">
                      <p className="text-3xl font-black text-amber-500">
                        {horoscope.score || 0}
                        <span className="text-sm text-muted-foreground">/36</span>
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                        Total Points
                      </p>
                    </div>
                    <div className="h-10 w-px bg-amber-500/20" />
                    <div className="text-left">
                      <p className="text-lg font-black text-foreground uppercase tracking-tight">
                        {horoscope.conclusion || "Good Match"}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium leading-tight">
                        Highly compatible based on Vedic astrology charts.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(
                      horoscope.details || {
                        Varna: "1/1",
                        Vashya: "2/2",
                        Tara: "3/3",
                        Yoni: "4/4",
                      }
                    ).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-xl">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{key}</span>
                        <span className="text-[10px] font-black text-amber-500">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {!access?.isPremium && !isOwnProfile && (
            <Card className="border-none bg-gradient-to-r from-rose-600 to-primary p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:rotate-12 transition-transform">
                <Crown className="w-16 h-16" />
              </div>
              <div className="relative z-10 space-y-4">
                <h4 className="text-xl font-black uppercase italic">Unlock Premium Access</h4>
                <p className="text-sm font-medium text-white/80 max-w-sm leading-relaxed">
                  Backend entitlements control chat initiation, contact visibility, visitor insights, and premium visibility.
                </p>
                <Button
                  className="bg-white text-primary hover:bg-white/90 font-black rounded-xl px-10 h-12 uppercase tracking-widest text-xs"
                  onClick={() => router.push("/dashboard/membership")}
                >
                  UPGRADE NOW
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function HighlightCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="p-6 bg-card/40 backdrop-blur-md rounded-[2rem] border border-white/5 flex gap-4 items-center">
      <div className="bg-primary/10 p-4 rounded-2xl">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  isLocked = false,
}: {
  label: string;
  value: string;
  isLocked?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <p className={`text-lg font-bold ${isLocked ? "blur-sm text-muted-foreground" : "text-foreground"}`}>
          {value}
        </p>
        {isLocked && <Lock className="w-3 h-3 text-primary opacity-50" />}
      </div>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
