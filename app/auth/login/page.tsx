import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/modules/auth/components/LoginForm";
import { Shield, Zap, Building2 } from "lucide-react";
import Image from "next/image";

export default async function LoginPage() {
  // Middleware'de zaten kontrol yapılıyor, kullanıcı varsa redirect edilecek
  // Burada sadece formu göster

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black">
      {/* Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>
      
      {/* Subtle Animated Orbs - Dark tones with red accent */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-red-900/30 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-red-800/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-md px-6 py-8">
        {/* Logo Card */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4 rounded-2xl glass-effect shadow-glow p-3">
            <Image 
              src="/logo-aem.png" 
              alt="Logo" 
              width={80} 
              height={80} 
              className="object-contain"
              priority
            />
          </div>
          <p className="text-red-100 text-sm md:text-base lg:text-base xl:text-lg font-medium">
            Saha İş Takip Sistemi
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-effect rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-lg md:text-xl lg:text-xl xl:text-2xl font-bold text-white mb-2">Hoş Geldiniz</h2>
            <p className="text-red-100 text-xs md:text-sm lg:text-sm xl:text-sm">
              Hesabınıza giriş yaparak devam edin
            </p>
          </div>
          <LoginForm />
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="glass-effect rounded-xl p-4 backdrop-blur-xl">
            <Shield className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-xs text-red-100 font-medium">Güvenli</p>
          </div>
          <div className="glass-effect rounded-xl p-4 backdrop-blur-xl">
            <Zap className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-xs text-red-100 font-medium">Hızlı</p>
          </div>
          <div className="glass-effect rounded-xl p-4 backdrop-blur-xl">
            <Building2 className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-xs text-red-100 font-medium">Profesyonel</p>
          </div>
        </div>
      </div>
    </div>
  );
}
