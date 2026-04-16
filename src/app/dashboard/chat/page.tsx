"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    MessageSquare, 
    Send, 
    MoreVertical, 
    Phone, 
    Video, 
    Image as ImageIcon,
    Smile,
    Search,
    ArrowLeft,
    CheckCheck,
    Loader2,
    Heart,
    ShieldCheck,
    Crown,
    Info,
    Trash2,
    Sparkles,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/hooks/use-chat";
import { useConversations } from "@/hooks/use-conversations";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserAccess } from "@/hooks/use-user-access";
import { useInteractionStore } from "@/store/interaction-store";

export default function ChatPage({ initialUserId: propUserId }: { initialUserId?: number | null }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlUserId = searchParams.get("userId");
    const initialUserId = propUserId || (urlUserId ? parseInt(urlUserId) : null);

    const { data: conversations, isLoading: convsLoading } = useConversations();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(initialUserId || null);
    
    const handleConversationSelect = (userId: number) => {
        setSelectedUserId(userId);
        router.push(`/dashboard/chat?userId=${userId}`, { scroll: false });
    };

    // Auto-select first conversation ONLY if no selection and no URL ID
    useEffect(() => {
        if (!selectedUserId && !urlUserId && conversations && conversations.length > 0) {
            setSelectedUserId(conversations[0].user.id);
        }
    }, [conversations, selectedUserId, urlUserId]);

    // Sync state if URL changes (external navigation)
    useEffect(() => {
        if (urlUserId) {
            const id = parseInt(urlUserId);
            if (id !== selectedUserId) {
                setSelectedUserId(id);
            }
        }
    }, [urlUserId, selectedUserId]);

    const { relationships, syncFromApi, sendInterest } = useInteractionStore();
    const activeConv = useMemo(() => conversations?.find(c => c.user.id === selectedUserId), [conversations, selectedUserId]);
    
    // Sync store with conversation data
    useEffect(() => {
        if (conversations) {
            conversations.forEach(c => {
                syncFromApi(c.user.id, { 
                    status: 'accepted', // If they are in the chat list, usually matched
                    isVerified: c.user.profile.isVerified,
                    updatedAt: c.lastMessageAt
                });
            });
        }
    }, [conversations, syncFromApi]);

    const { data: access } = useUserAccess();
    const isPremium = access?.isPremium;

    const state = selectedUserId ? relationships[selectedUserId] : null;
    const isMatched = state?.type === "matched";
    const hasAccess = isMatched || isPremium;
    
    const { messages, isTyping, isOnline, isLoading: chatLoading, sendMessage, sendTyping, deleteMessage, deleteConversation } = useChat(selectedUserId);

    const [msgInput, setMsgInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const suggestions = ["Hi 👋", "Tell me more about yourself", "What are your interests?", "I'd love to connect!"];

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedUserId) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('Image size should be less than 5MB');
            return;
        }

        setIsUploading(true);
        try {
            // Convert to base64 for immediate preview
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Send as IMAGE type
                sendMessage(base64String, "IMAGE");
                setIsUploading(false);
            };
            reader.onerror = () => {
                alert('Failed to read image file');
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Failed to upload image');
            setIsUploading(false);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [selectedUserId, sendMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (text?: string) => {
        const message = text || msgInput;
        if (!message.trim()) return;
        sendMessage(message);
        setMsgInput("");
        sendTyping(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMsgInput(e.target.value);
        if (e.target.value.length > 0) {
            sendTyping(true);
        } else {
            sendTyping(false);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden animate-fade-in px-4 lg:px-0">
            {/* Conversations List */}
            <div className={`flex-col gap-4 ${selectedUserId ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 transition-all`}>
                <div className="px-2 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Messages</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mt-1">Chat Safely</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">{conversations?.length || 0} People</Badge>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Search chats..." 
                        className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 font-bold placeholder:text-muted-foreground/50 transition-all border-dashed"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar no-scrollbar">
                    {convsLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : conversations && conversations.length > 0 ? (
                        conversations.map((conv) => (
                            <div 
                                key={conv.user.id}
                                onClick={() => handleConversationSelect(conv.user.id)}
                                className={`flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-300 cursor-pointer group ${selectedUserId === conv.user.id ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-[1.02]' : 'bg-card/40 border border-white/5 hover:bg-white/5'}`}
                            >
                                <div className="relative">
                                    <Avatar className={`h-16 w-16 border-2 transition-all ${selectedUserId === conv.user.id ? 'border-white/40' : 'border-white/10 group-hover:border-primary/40'}`}>
                                        <AvatarImage src={conv.user.profilePicture || conv.user.profile.media?.[0]?.url} className="object-cover" />
                                        <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">{conv.user.profile.firstName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {isOnline && selectedUserId === conv.user.id && (
                                        <div className="absolute bottom-1 right-1 h-4 w-4 bg-emerald-500 rounded-full border-4 border-[#0a0a0a] ring-2 ring-emerald-500/20" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className={`font-black text-sm truncate ${selectedUserId === conv.user.id ? 'text-white' : 'text-foreground'}`}>
                                            {conv.user.profile.firstName} {conv.user.profile.lastName}
                                        </p>
                                        <span className={`text-[9px] font-black uppercase opacity-60`}>
                                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={`text-[11px] truncate italic font-medium ${selectedUserId === conv.user.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                                            {conv.lastMessage?.content ? `"${conv.lastMessage.content}"` : 'Soulmate connection waiting...'}
                                        </p>
                                        {conv.unreadCount > 0 && selectedUserId !== conv.user.id && (
                                            <span className="bg-primary text-white text-[9px] font-black h-5 w-5 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-primary/40 ml-2 shrink-0">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-8 opacity-20 group">
                            <Heart className="w-12 h-12 mb-4 group-hover:scale-125 transition-transform duration-700" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No connections yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <Card className={`flex-1 flex flex-col bg-[#0d0d0d] border border-white/5 rounded-[3rem] overflow-hidden shadow-4xl relative ${!selectedUserId ? 'hidden lg:flex' : 'flex'}`}>
                {!selectedUserId ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-12">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                            <div className="relative p-12 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-3xl">
                                <MessageSquare className="w-20 h-20 text-primary opacity-50" />
                            </div>
                        </div>
                        <div className="space-y-3 max-w-sm">
                            <h3 className="text-3xl font-black uppercase tracking-tighter text-foreground">Select a <span className="text-primary italic">Connection</span></h3>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-loose italic opacity-60">Begin your secure and meaningful conversation with your prospective soulmate today.</p>
                        </div>
                    </div>
                ) : !hasAccess ? (
                    /* LOCKED STATE */
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-12 bg-black/20">
                        <div className="p-8 bg-amber-500/10 rounded-full border border-amber-500/20">
                            <ShieldCheck className="w-16 h-16 text-amber-500 opacity-50" />
                        </div>
                        <div className="space-y-4 max-w-md">
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Conversation <span className="text-amber-500">Locked</span></h3>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-loose italic opacity-60">You can only chat with members who have accepted your interest.</p>
                            <Button 
                                onClick={() => sendInterest(selectedUserId!)}
                                className="h-14 w-full rounded-2xl bg-amber-500 text-black hover:bg-amber-600 font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20"
                            >
                                Send Interest to Chat
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl z-20 sticky top-0">
                            <div className="flex items-center gap-5">
                                <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-12 w-12 hover:bg-white/5" onClick={() => setSelectedUserId(null)}>
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                                <div className="relative group cursor-pointer" onClick={() => router.push(`/dashboard/profile/${selectedUserId}`)}>
                                    <Avatar className="h-14 w-14 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all border border-black shadow-2xl">
                                        <AvatarImage src={activeConv?.user.profilePicture || activeConv?.user.profile.media?.[0]?.url} className="object-cover" />
                                        <AvatarFallback className="bg-primary/10 text-primary font-black">{activeConv?.user.profile.firstName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#0d0d0d] shadow-lg ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                </div>
                                <div className="cursor-pointer" onClick={() => router.push(`/dashboard/profile/${selectedUserId}`)}>
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-lg tracking-tight hover:text-primary transition-colors text-white">{activeConv?.user.profile.firstName} {activeConv?.user.profile.lastName}</p>
                                        {activeConv?.user.profile.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                            {isTyping ? <span className="italic animate-pulse">is typing message...</span> : (isOnline ? 'Online Now' : 'Last seen recently')}
                                        </p>
                                        <span className="text-[8px] text-muted-foreground opacity-30">•</span>
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] flex items-center gap-1">
                                            Matched on {state?.matchDate ? new Date(state.matchDate).toLocaleDateString() : 'SOMEDAY'} <Heart className="w-2.5 h-2.5 fill-primary text-primary" />
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-white/5 h-11 w-11 text-muted-foreground hidden sm:flex"><Phone className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-white/5 h-11 w-11 text-muted-foreground hidden sm:flex"><Video className="h-5 w-5" /></Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-white/5 h-11 w-11 text-muted-foreground"><MoreVertical className="h-5 w-5" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#111] border border-white/10 rounded-2xl w-56 p-2 shadow-4xl backdrop-blur-2xl">
                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/profile/${selectedUserId}`)} className="rounded-xl cursor-pointer p-3 font-black uppercase tracking-widest text-[9px] gap-3">
                                            <User className="w-4 h-4 text-primary" /> View Full Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                if (selectedUserId && window.confirm("Delete this entire conversation?")) {
                                                    deleteConversation.mutate(selectedUserId, {
                                                        onSuccess: () => setSelectedUserId(null)
                                                    });
                                                }
                                            }}
                                            className="text-red-500 focus:text-white focus:bg-red-500 rounded-xl cursor-pointer p-3 font-black uppercase tracking-widest text-[9px] mt-1 gap-3 border-t border-white/5"
                                        >
                                            <Trash2 className="w-4 h-4" /> Clear Conversation
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 custom-scrollbar no-scrollbar relative">
                            {/* "MATCHED!" Banner - Business Logic Requirement */}
                            {messages.length < 15 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 rounded-[2.5rem] mb-12 text-center space-y-4"
                                >
                                    <div className="relative">
                                        <Heart className="w-12 h-12 text-primary fill-primary animate-pulse" />
                                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-500 animate-bounce" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black uppercase tracking-tighter">You are <span className="text-primary italic">Matched!</span></h4>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">You can now chat with {activeConv?.user.profile.firstName} for free</p>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Badge className="bg-white/5 text-[8px] font-black uppercase tracking-widest border border-white/10">Verified Match</Badge>
                                        <Badge className="bg-white/5 text-[8px] font-black uppercase tracking-widest border border-white/10">End-to-End Encrypted</Badge>
                                    </div>
                                </motion.div>
                            )}

                            {chatLoading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary opacity-30" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Decrypting messages...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="p-10 bg-white/5 rounded-[3rem] border border-dashed border-white/10 animate-pulse">
                                        <MessageSquare className="w-16 h-16 text-primary opacity-20" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-white">Start your <span className="text-primary italic">Conversation</span></h3>
                                        <p className="font-black uppercase tracking-[0.4em] text-[10px] italic text-muted-foreground opacity-40 max-w-xs px-10">Matched with {activeConv?.user.profile.firstName}. Start with a friendly Hello!</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {messages.map((message, idx) => {
                                        const isSystem = message.type === "SYSTEM";
                                        const isMe = message.sender === 'me';
                                        
                                        if (isSystem) {
                                            return (
                                                <div key={idx} className="flex justify-center my-6">
                                                    <Badge className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground py-1.5 px-4 rounded-full border-none">
                                                        {message.text}
                                                    </Badge>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div 
                                                key={idx}
                                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                            >
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95, x: isMe ? 20 : -20 }}
                                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                                    className={`relative group/msg max-w-[85%] lg:max-w-[70%] p-6 rounded-[2.2rem] text-[15px] font-semibold leading-[1.6] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white/5 text-foreground rounded-bl-none border border-white/5'}`}
                                                >
                                                    {message.type === "IMAGE" && message.imageUrl ? (
                                                        <div className="space-y-3">
                                                            <img src={message.imageUrl} alt="shared file" className="rounded-2xl max-h-80 w-full object-cover" />
                                                            {message.text && <p>{message.text}</p>}
                                                        </div>
                                                    ) : (
                                                        message.text
                                                    )}
                                                    
                                                    {message.id && (
                                                        <button 
                                                            onClick={() => {
                                                                if (window.confirm("Delete this message?")) {
                                                                    deleteMessage.mutate(message.id!);
                                                                }
                                                            }}
                                                            className={`absolute top-0 ${isMe ? '-left-12' : '-right-12'} opacity-0 group-hover/msg:opacity-100 transition-all p-3 text-muted-foreground hover:text-red-500 active:scale-90`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </motion.div>
                                                <div className={`flex items-center gap-2 mt-3 px-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">{message.time}</span>
                                                    {isMe && (
                                                        <div className="flex items-center">
                                                            <CheckCheck className={`w-3.5 h-3.5 ${message.status === 'read' ? 'text-primary' : 'text-muted-foreground opacity-30'}`} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-white/5 w-fit px-5 py-3 rounded-full border border-white/5 ml-2 shadow-xl">
                                    <div className="flex gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">{activeConv?.user.profile.firstName} is thinking...</span>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        {/* Suggestions */}
                        {messages.length === 0 && (
                            <div className="px-10 py-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                {suggestions.map((s, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleSend(s)}
                                        className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/20 hover:border-primary/30 transition-all active:scale-95 shadow-xl"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Chat Input Area */}
                        <div className="p-6 lg:p-10 border-t border-white/5 bg-black/60 backdrop-blur-3xl z-20">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-3 pl-8 focus-within:border-primary/50 transition-all shadow-inner group/form"
                            >
                                <button type="button" className="text-muted-foreground hover:text-primary transition-all active:scale-90"><Smile className="w-7 h-7" /></button>
                                <input 
                                    placeholder="Type your secure message..."
                                    className="flex-1 bg-transparent border-none outline-none text-[15px] text-foreground py-3 font-semibold placeholder:text-muted-foreground/30"
                                    value={msgInput}
                                    onChange={handleInputChange}
                                />
                                <div className="flex items-center gap-2 pr-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-2xl h-12 w-12 text-muted-foreground hover:text-primary transition-all active:scale-95"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6" />
                                        )}
                                    </Button>
                                    <Button 
                                        type="submit"
                                        className="h-12 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 transition-all active:scale-90 flex items-center justify-center p-0"
                                        disabled={!msgInput.trim()}
                                    >
                                        <Send className="h-5 w-5 fill-current" />
                                    </Button>
                                </div>
                            </form>
                            <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 mt-6">Secure Gateway Active • Private Conversation</p>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
