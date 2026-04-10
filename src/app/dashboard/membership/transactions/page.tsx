"use client";

import { motion } from "framer-motion";
import { 
    Receipt, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Download, 
    ArrowLeft,
    CreditCard,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const TRANSACTIONS = [
    {
        id: "TXN_7721882",
        plan: "Platinum Membership",
        amount: 2499,
        date: "24 Oct, 2023",
        time: "11:45 AM",
        status: "SUCCESS",
        method: "UPI (Razorpay)"
    },
    {
        id: "TXN_7721855",
        plan: "Profile Boost (7 Days)",
        amount: 499,
        date: "12 Oct, 2023",
        time: "09:30 PM",
        status: "SUCCESS",
        method: "Credit Card"
    },
    {
        id: "TXN_7721840",
        plan: "Gold Membership",
        amount: 1499,
        date: "05 Sep, 2023",
        time: "02:15 PM",
        status: "FAILED",
        method: "Debit Card"
    }
];

export default function TransactionHistoryPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Link href="/dashboard/membership" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Plans</span>
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Transaction <span className="text-primary italic">History</span></h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs">Manage your billing & payments</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/40 backdrop-blur-3xl border-white/5 rounded-[2rem] p-8 flex flex-col justify-between group hover:border-primary/20 transition-all">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Spent</p>
                        <h3 className="text-3xl font-black text-foreground italic">₹2,998</h3>
                    </div>
                </Card>

                <Card className="bg-card/40 backdrop-blur-3xl border-white/5 rounded-[2rem] p-8 flex flex-col justify-between group hover:border-green-500/20 transition-all">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Successful</p>
                        <h3 className="text-3xl font-black text-foreground italic">02</h3>
                    </div>
                </Card>

                <Card className="bg-card/40 backdrop-blur-3xl border-white/5 rounded-[2rem] p-8 flex flex-col justify-between group hover:border-blue-500/20 transition-all">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                        <ShieldCheck className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active Plan</p>
                        <h3 className="text-3xl font-black text-foreground italic">Platinum</h3>
                    </div>
                </Card>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-6 mb-2">
                    <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Recent Payments</h2>
                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">Download All</Button>
                </div>

                <div className="grid gap-4">
                    {TRANSACTIONS.map((txn, idx) => (
                        <motion.div
                            key={txn.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="bg-card/30 backdrop-blur-xl border-white/5 rounded-[2rem] overflow-hidden group hover:bg-card/50 transition-all">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                                        txn.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                        {txn.status === 'SUCCESS' ? <Receipt className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                                            <h4 className="font-black text-lg text-foreground uppercase tracking-tight">{txn.plan}</h4>
                                            <Badge className={`w-fit py-0 px-2 rounded-lg text-[8px] font-black ${
                                                txn.status === 'SUCCESS' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                            }`}>
                                                {txn.status}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase">{txn.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase">{txn.time}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <CreditCard className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase">{txn.method}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 text-right">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount Paid</p>
                                            <h3 className="text-2xl font-black text-foreground italic">₹{txn.amount.toLocaleString()}</h3>
                                        </div>
                                        {txn.status === 'SUCCESS' && (
                                            <Button variant="outline" size="sm" className="h-10 rounded-xl border-white/10 hover:bg-white/5 gap-2 px-4 shadow-xl">
                                                <Download className="w-4 h-4 text-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Invoice</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center justify-center p-8 bg-white/5 border border-white/5 rounded-[2rem] gap-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest text-center max-w-lg">
                    Your payments are secured with 256-bit encryption. We do not store your card details on our servers.
                </p>
            </div>
        </div>
    );
}
