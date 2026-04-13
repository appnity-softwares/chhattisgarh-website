'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/hooks/use-toast';

import { UserRole, type User } from '@/types/api.types';

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing credentials',
        description: 'Please enter both username and password.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.adminLogin(username, password);
      login(
        { 
          id: 0,
          email: response.user.email, 
          role: response.user.role as UserRole,
          phone: '',
          isPhoneVerified: true,
          isActive: true,
          isBanned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as User,
        response.token,
        response.refreshToken || ''
      );
      toast({ title: 'Welcome back!', description: 'Signed into Admin Console.' });
      router.push('/admin');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="login-orb-1" />
      <div className="login-orb-2" />

      {/* Animated grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(109,40,217,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(109,40,217,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Card */}
        <div
          className="rounded-3xl p-8 sm:p-10 glass-card stat-card-glow"
          style={{
            background: 'linear-gradient(145deg, rgba(109,40,217,0.08), rgba(30,27,75,0.95))',
            border: '1px solid rgba(109,40,217,0.2)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center glow-purple animate-float">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0d0d1a] flex items-center justify-center">
                <Shield className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Admin Console
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Chhattisgarh Shaadi · Secure Access
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username / Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="username">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="username"
                  type="text"
                  placeholder="admin@cgshadi.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  className="
                    w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white
                    bg-white/[0.05] border border-white/[0.08]
                    placeholder:text-muted-foreground
                    focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="
                    w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white
                    bg-white/[0.05] border border-white/[0.08]
                    placeholder:text-muted-foreground
                    focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3.5 rounded-xl font-semibold text-sm text-white
                btn-primary-gradient
                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                flex items-center justify-center gap-2 mt-2
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign In to Console'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-xs text-muted-foreground">
              Protected by enterprise-grade security
            </p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-muted-foreground">System Online</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-[10px] text-muted-foreground">v2.0.0</span>
            </div>
          </div>
        </div>

        {/* Bottom label */}
        <p className="text-center text-xs text-muted-foreground mt-4 opacity-60">
          © 2025 Chhattisgarh Shaadi · All rights reserved
        </p>
      </div>
    </div>
  );
}
