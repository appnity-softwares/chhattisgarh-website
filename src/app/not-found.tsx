'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 overflow-hidden relative selection:bg-primary/20">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center relative z-10 max-w-2xl mx-auto space-y-8"
            >
                {/* 404 Visual */}
                <div className="relative font-bold text-[12rem] leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary/20 to-transparent select-none">
                    404
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center text-4xl md:text-6xl text-foreground font-extrabold tracking-normal"
                    >
                        Page Not Found
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <p className="text-xl text-muted-foreground max-w-md mx-auto">
                        Oops! It seems you&apos;ve ventured into uncharted territory. The page you are looking for has been moved or doesn&apos;t exist.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <Link href="/">
                            <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                                <Home className="mr-2 h-5 w-5" />
                                Return Home
                            </Button>
                        </Link>

                        <Button
                            variant="outline"
                            size="lg"
                            className="h-12 px-8 text-base hover:bg-muted/50 transition-all duration-300"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Go Back
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
