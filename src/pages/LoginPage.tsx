import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, ArrowRight, Lock, Mail, User, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(name, email, password);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    await quickLoginAs(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-md">
          V
        </div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          Vipto Docs
        </h2>
        <p className="text-xs text-muted-foreground">
          Central documentation and knowledge platform for Vipto
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-6 shadow-xl rounded-2xl border border-border sm:px-10 space-y-6">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-xl bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground text-[10px] font-bold">
                Or with email
              </span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ayush Kumar"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@vipto.io"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading
                ? 'Please wait...'
                : isSignUp
                ? 'Create Vipto Account'
                : 'Sign In to Workspace'}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account yet? Create one"}
            </button>
          </div>

          {/* Quick Demo Role Selector */}
          <div className="pt-4 border-t border-border">
            <div className="text-center mb-2.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Instant Demo Access (Pick Role)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('Owner')}
                className="p-2 rounded-xl border border-border bg-background hover:bg-primary/10 hover:border-primary/40 text-left transition-all"
              >
                <div className="font-bold text-xs text-foreground">👑 Owner</div>
                <div className="text-[10px] text-muted-foreground">Full admin control</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('Admin')}
                className="p-2 rounded-xl border border-border bg-background hover:bg-primary/10 hover:border-primary/40 text-left transition-all"
              >
                <div className="font-bold text-xs text-foreground">🛡️ Admin</div>
                <div className="text-[10px] text-muted-foreground">Manage spaces</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('Editor')}
                className="p-2 rounded-xl border border-border bg-background hover:bg-primary/10 hover:border-primary/40 text-left transition-all"
              >
                <div className="font-bold text-xs text-foreground">✍️ Editor</div>
                <div className="text-[10px] text-muted-foreground">Create & edit docs</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('Viewer')}
                className="p-2 rounded-xl border border-border bg-background hover:bg-primary/10 hover:border-primary/40 text-left transition-all"
              >
                <div className="font-bold text-xs text-foreground">👀 Viewer</div>
                <div className="text-[10px] text-muted-foreground">Read-only view</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
