"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
    ShieldCheck, 
    Upload, 
    CheckCircle2, 
    AlertCircle, 
    X,
    FileText,
    ArrowLeft,
    Shield,
    Lock,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { verificationsService } from "@/services/verifications.service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function VerificationPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast({
                    title: "File too large",
                    description: "Maximum file size is 5MB",
                    variant: "destructive"
                });
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("document", file);
            await verificationsService.submitVerification(formData);
            setIsSuccess(true);
            toast({
                title: "Success",
                description: "Verification document submitted successfully",
            });
        } catch (error: unknown) {
            toast({
                title: "Upload Failed",
                description: error.message || "Failed to submit document",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-xl mx-auto py-12 px-4 text-center">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-8"
                >
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/10">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Under <span className="text-primary italic">Review</span></h1>
                        <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] leading-loose max-w-sm mx-auto">Your document has been securely uploaded. Our moderation team will verify it within 24-48 hours. You will receive a notification once approved.</p>
                    </div>
                    <Button 
                        onClick={() => router.push("/dashboard/profile")}
                        className="h-14 px-10 bg-primary text-white hover:bg-primary/90 font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl"
                    >
                        Return to Profile
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-foreground via-primary/5 to-transparent rounded-[3rem] p-10 md:p-16 border border-white/5 shadow-3xl">
                <div className="absolute -top-12 -right-12 p-8 opacity-5">
                    <ShieldCheck className="w-64 h-64 text-white" />
                </div>
                
                <div className="relative z-10 space-y-6">
                    <Link href="/dashboard/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Profile</span>
                    </Link>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-primary/20 text-primary border border-primary/20 p-2 rounded-xl">
                                <Shield className="w-5 h-5" />
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-none">Trust & <span className="text-primary italic">Safety</span></h1>
                        </div>
                        <p className="text-muted-foreground font-bold text-lg max-w-2xl leading-relaxed uppercase tracking-widest text-[11px] opacity-60">Verified profiles receive <span className="text-white italic">300% more engagements</span> and show up first in search results. Verify your identity securely today.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Upload Section */}
                <div className="lg:col-span-7 space-y-8">
                    <Card className="bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative">
                        {!file ? (
                            <div className="space-y-8 text-center">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Identity <span className="text-primary italic">Document</span></h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-relaxed">Upload Aadhar, PAN, Voter ID or Passport</p>
                                </div>
                                <label className="block">
                                    <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-12 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group group-active:scale-95">
                                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Click or Drag to Upload</p>
                                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                    </div>
                                </label>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black uppercase tracking-tighter">Previewing <span className="text-primary italic">Document</span></h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 truncate max-w-[200px]">{file.name}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreview(null); }} className="rounded-2xl hover:bg-red-500/10 text-red-500 h-12 w-12 border border-red-500/20">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                                
                                <div className="relative aspect-video bg-black/40 rounded-[2rem] overflow-hidden border border-white/5">
                                    {preview ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={preview} alt="Document Preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground/20">
                                            <FileText className="w-16 h-16" />
                                            <p className="text-[10px] font-black uppercase">Document Selected</p>
                                        </div>
                                    )}
                                </div>

                                <Button 
                                    onClick={handleSubmit}
                                    disabled={isUploading}
                                    className="w-full h-16 bg-primary text-white hover:bg-primary/90 font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                                >
                                    {isUploading ? "Uploading Securely..." : "Submit for Verification"}
                                </Button>
                            </div>
                        )}
                    </Card>

                    <div className="flex items-center gap-4 p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/10">
                        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 leading-relaxed">Ensure the document is clear, all edges are visible, and data is readable to avoid rejection.</p>
                    </div>
                </div>

                {/* Info Section */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="bg-foreground border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                        <div className="space-y-2">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary italic">Why Verify?</h4>
                            <p className="text-lg font-black uppercase tracking-tighter leading-none">Your trust is our <span className="text-primary">priority</span></p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { icon: ShieldCheck, title: "Verified Badge", desc: "Get the prestigious checkmark next to your name." },
                                { icon: Lock, title: "Privacy First", desc: "Documents are only visible to our verification team." },
                                { icon: Eye, title: "Boost Visibility", desc: "Top placement in search and match suggestions." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5 group">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-primary transition-all group-hover:scale-110">
                                        <item.icon className="w-5 h-5 group-hover:text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="text-[11px] font-black uppercase tracking-widest">{item.title}</h5>
                                        <p className="text-[9px] font-bold uppercase text-muted-foreground/40 leading-loose">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-foreground bg-primary/20" />
                                    ))}
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 italic">+12k Verified Members</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
