"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user && data.session) {
        // Giriş başarılı, session mevcut
        // Session cookie'lere yazılması için bekleme
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Profile'ı al
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        // Profile bulunursa direkt yönlendir
        if (profile && !profileError) {
          if (profile.role === "admin") {
            window.location.href = "/admin/dashboard";
          } else {
            window.location.href = "/dashboard";
          }
        } else {
          // Profile bulunamazsa ana sayfaya git
          window.location.href = "/";
        }
      } else if (data.user && !data.session) {
        setError("Session oluşturulamadı. Lütfen tekrar deneyin.");
        setLoading(false);
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            E-posta Adresi
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-500/50 p-4 animate-in slide-in-from-top-1">
          <div className="text-sm text-red-100 font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full gradient-primary hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Giriş yapılıyor...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Giriş Yap
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
