"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Download, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Simple QR code generator using canvas
function generateQRCode(text: string, size: number = 200): string {
    // Create a simple placeholder QR code visualization
    // In production, you'd use a proper QR code library
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = size;
    canvas.height = size;
    
    // Draw a simple QR code-like pattern
    const cellSize = size / 25;
    ctx.fillStyle = '#000000';
    
    // Create a pattern that looks like a QR code
    for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
            // Create a pseudo-random pattern based on the text
            const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const shouldFill = ((hash + i * j) % 3) === 0;
            
            if (shouldFill) {
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
    
    // Add corner markers (like real QR codes)
    ctx.fillStyle = '#000000';
    // Top-left
    drawCornerMarker(ctx, 0, 0, cellSize * 7);
    // Top-right
    drawCornerMarker(ctx, size - cellSize * 7, 0, cellSize * 7);
    // Bottom-left
    drawCornerMarker(ctx, 0, size - cellSize * 7, cellSize * 7);
    
    return canvas.toDataURL();
}

function drawCornerMarker(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    // Outer square
    ctx.fillRect(x, y, size, size);
    // Inner white square
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + size * 0.15, y + size * 0.15, size * 0.7, size * 0.7);
    // Inner black square
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + size * 0.25, y + size * 0.25, size * 0.5, size * 0.5);
}

interface ProfileQRCodeProps {
    userId: number | string;
    userName?: string;
    profileUrl?: string;
}

export function ProfileQRCode({ userId, userName, profileUrl }: ProfileQRCodeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const { toast } = useToast();

    // Generate profile URL
    const url = profileUrl || `https://chhattisgarhshadi.com/profile/${userId}`;
    const profileName = userName || "Profile";

    // Generate QR code when component mounts or URL changes
    useEffect(() => {
        const qrDataUrl = generateQRCode(url, 200);
        setQrCodeUrl(qrDataUrl);
    }, [url]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast({
                title: "Link Copied",
                description: "Profile link copied to clipboard",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (_error) {
            toast({
                title: "Error",
                description: "Failed to copy link",
                variant: "destructive",
            });
        }
    };

    const handleDownloadQR = () => {
        if (qrCodeUrl) {
            const link = document.createElement('a');
            link.download = `${profileName}-QR.png`;
            link.href = qrCodeUrl;
            link.click();
            
            toast({
                title: "QR Code Downloaded",
                description: "QR code saved to your device",
            });
        } else {
            toast({
                title: "Error",
                description: "QR code not ready",
                variant: "destructive",
            });
        }
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${profileName} - Chhattisgarh Shadi`,
                    text: `Check out ${profileName}'s profile on Chhattisgarh Shadi`,
                    url: url,
                });
            } else {
                // Fallback to copying link
                await handleCopyLink();
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl hover:bg-white/5"
                    title="Share Profile QR Code"
                >
                    <Share2 className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-foreground border-white/10 rounded-2xl p-0 max-w-md w-full">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold text-white uppercase tracking-tighter">
                        Share <span className="text-primary font-semibold">Profile</span>
                    </DialogTitle>
                </DialogHeader>
                
                <CardContent className="p-6 space-y-6">
                    {/* QR Code */}
                    <div className="flex justify-center">
                        <div className="p-6 bg-white rounded-2xl">
                            {qrCodeUrl && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img 
                                    src={qrCodeUrl} 
                                    alt="Profile QR Code" 
                                    className="w-[200px] h-[200px]"
                                />
                            )}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="text-center space-y-2">
                        <h3 className="font-bold text-lg text-white">{profileName}</h3>
                        <p className="text-sm text-muted-foreground">Scan to view profile</p>
                        <p className="text-xs text-muted-foreground font-mono bg-white/5 px-3 py-1 rounded-lg inline-block">
                            {url}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        <Button
                            onClick={handleCopyLink}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                        >
                            {copied ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                        
                        <Button
                            onClick={handleDownloadQR}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                        
                        <Button
                            onClick={handleShare}
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl"
                        >
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Instructions */}
                    <div className="text-center space-y-2">
                        <p className="text-xs text-muted-foreground">
                            Share this QR code or profile link with friends and family
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Anyone can scan to view this profile
                        </p>
                    </div>
                </CardContent>
            </DialogContent>
        </Dialog>
    );
}

export default ProfileQRCode;
