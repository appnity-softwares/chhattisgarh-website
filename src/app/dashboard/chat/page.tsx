"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
    Loader2
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
import { Trash2 } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useConversations } from "@/hooks/use-conversations";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";

export default function ChatPage({ initialUserId: propUserId }: { initialUserId?: number | null }) {
    const searchParams = useSearchParams();
    const urlUserId = searchParams.get("userId");
    const initialUserId = propUserId || (urlUserId ? parseInt(urlUserId) : null);

    const { data: conversations, isLoading: convsLoading } = useConversations();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(initialUserId || null);
    
    // Auto-select first conversation if no initial ID or if ID changes
    useEffect(() => {
        if (initialUserId) {
            setSelectedUserId(initialUserId);
        } else if (conversations && conversations.length > 0 && !selectedUserId) {
            setSelectedUserId(conversations[0].user.id);
        }
    }, [conversations, initialUserId]);

    const activeConv = conversations?.find(c => c.user.id === selectedUserId);
    const { messages, isTyping, isOnline, isLoading: chatLoading, sendMessage, sendTyping, deleteMessage, deleteConversation } = useChat(selectedUserId);
    
    const [msgInput, setMsgInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!msgInput.trim()) return;
        sendMessage(msgInput);
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
        <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden">
            {/* Conversations List */}
            <div className="hidden md:flex w-96 flex-col gap-4">
                <div className="px-1 flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Messages</h2>
                    <Badge className="bg-primary/20 text-primary border-primary/20">{conversations?.length || 0} Inbox</Badge>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search conversations..." 
                        className="pl-12 h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 font-medium"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {convsLoading ? (
                        <div className="flex flex-col gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-white/5 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : conversations?.map((conv) => (
                        <div 
                            key={conv.user.id}
                            onClick={() => setSelectedUserId(conv.user.id)}
                            className={`flex items-center gap-4 p-4 rounded-3xl transition-all cursor-pointer border ${selectedUserId === conv.user.id ? 'bg-primary/10 border-primary/20 shadow-lg shadow-primary/5' : 'bg-card/40 border-white/5 hover:bg-white/5'}`}
                        >
                            <div className="relative">
                                <Avatar className="h-14 w-14 ring-2 ring-white/10">
                                    <AvatarImage src={conv.user.profilePicture || conv.user.profile.media?.[0]?.url} />
                                    <AvatarFallback>{conv.user.profile.firstName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {isOnline && selectedUserId === conv.user.id && (
                                    <div className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <p className={`font-black text-sm truncate ${selectedUserId === conv.user.id ? 'text-primary' : 'text-foreground'}`}>
                                        {conv.user.profile.firstName} {conv.user.profile.lastName}
                                    </p>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground truncate italic">
                                        {conv.lastMessage?.content ? `"${conv.lastMessage.content}"` : 'No messages yet'}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <span className="bg-primary text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <Card className="flex-1 flex flex-col bg-card/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                {!selectedUserId ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                        <div className="p-8 bg-white/5 rounded-full ring-8 ring-white/5">
                            <MessageSquare className="w-16 h-16 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-widest text-foreground">Select a <span className="text-primary italic">Soulmate</span></h3>
                            <p className="text-sm font-medium text-muted-foreground italic">Your safe conversation is waiting to blossom.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" className="md:hidden rounded-xl h-10 w-10">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <Avatar className="h-12 w-12 border border-white/10">
                                    <AvatarImage src={activeConv?.user.profilePicture || activeConv?.user.profile.media?.[0]?.url} />
                                    <AvatarFallback>{activeConv?.user.profile.firstName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-black text-foreground">{activeConv?.user.profile.firstName} {activeConv?.user.profile.lastName}</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            {isTyping ? <span className="text-primary italic animate-bounce inline-block">typing...</span> : (isOnline ? 'Online' : 'Offline')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 text-muted-foreground"><Phone className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 text-muted-foreground"><Video className="h-5 w-5" /></Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 text-muted-foreground"><MoreVertical className="h-5 w-5" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 rounded-2xl w-48 p-2">
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                if (selectedUserId && window.confirm("Delete this entire conversation?")) {
                                                    deleteConversation.mutate(selectedUserId, {
                                                        onSuccess: () => setSelectedUserId(null)
                                                    });
                                                }
                                            }}
                                            className="text-red-400 focus:text-red-400 focus:bg-red-400/10 rounded-xl cursor-pointer p-3 font-bold uppercase tracking-widest text-[10px]"
                                        >
                                            <Trash2 className="w-4 h-4 mr-3" />
                                            Delete Chat
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar">
                            {chatLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                    <MessageSquare className="w-16 h-16" />
                                    <p className="font-black uppercase tracking-widest text-sm italic">Start your safe conversation now</p>
                                </div>
                            ) : (
                                messages.map((message, idx) => (
                                    <div 
                                        key={idx}
                                        className={`flex flex-col ${message.sender === 'me' ? 'items-end' : 'items-start'}`}
                                    >
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className={`relative group/msg max-w-[80%] p-5 rounded-[1.75rem] text-sm font-medium leading-relaxed shadow-xl ${message.sender === 'me' ? 'bg-primary text-white rounded-br-none shadow-primary/10' : 'bg-white/10 text-foreground rounded-bl-none border border-white/5'}`}
                                        >
                                            {message.type === "IMAGE" && message.imageUrl ? (
                                                <img src={message.imageUrl} alt="chat" className="rounded-xl max-h-64 object-cover mb-2" />
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
                                                    className={`absolute top-0 ${message.sender === 'me' ? '-left-10' : '-right-10'} opacity-0 group-hover/msg:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-red-400`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </motion.div>
                                        <div className="flex items-center gap-1.5 mt-2 px-1">
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{message.time}</span>
                                            {message.sender === 'me' && (
                                                <CheckCheck className={`w-3 h-3 ${message.status === 'read' ? 'text-primary' : 'text-muted-foreground font-black'}`} />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isTyping && (
                                <div className="flex items-center gap-2 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5 ml-1">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-100" />
                                        <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-6 md:p-8 border-t border-white/5 bg-white/5">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-[1.75rem] p-2 pl-6 focus-within:border-primary/40 transition-all shadow-inner"
                            >
                                <button type="button" className="text-muted-foreground hover:text-primary transition-colors"><Smile className="w-6 h-6" /></button>
                                <input 
                                    placeholder="Type your message here..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-foreground py-2 font-medium"
                                    value={msgInput}
                                    onChange={handleInputChange}
                                />
                                <div className="flex items-center gap-1 pr-1">
                                    <Button type="button" variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground hover:text-primary"><ImageIcon className="h-5 w-5" /></Button>
                                    <Button 
                                        type="submit"
                                        className="h-10 w-10 p-0 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-transform active:scale-90"
                                        disabled={!msgInput.trim()}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}


