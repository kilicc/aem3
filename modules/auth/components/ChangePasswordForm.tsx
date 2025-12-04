"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export default function ChangePasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Şifre en az 8 karakter olmalıdır";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Şifre en az bir küçük harf içermelidir";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Şifre en az bir büyük harf içermelidir";
    }
    if (!/(?=.*[0-9])/.test(password)) {
      return "Şifre en az bir rakam içermelidir";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Validasyonlar
      if (!formData.currentPassword) {
        setError("Mevcut şifrenizi giriniz");
        setLoading(false);
        return;
      }

      if (!formData.newPassword) {
        setError("Yeni şifrenizi giriniz");
        setLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("Yeni şifreler eşleşmiyor");
        setLoading(false);
        return;
      }

      if (formData.currentPassword === formData.newPassword) {
        setError("Yeni şifre mevcut şifre ile aynı olamaz");
        setLoading(false);
        return;
      }

      const passwordValidation = validatePassword(formData.newPassword);
      if (passwordValidation) {
        setError(passwordValidation);
        setLoading(false);
        return;
      }

      // Mevcut şifreyi kontrol et
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
        setLoading(false);
        return;
      }

      // Mevcut şifreyi doğrula
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: formData.currentPassword,
      });

      if (signInError) {
        setError("Mevcut şifre yanlış");
        setLoading(false);
        return;
      }

      // Şifreyi güncelle
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (updateError) {
        setError(updateError.message || "Şifre güncellenirken bir hata oluştu");
        setLoading(false);
        return;
      }

      // Başarılı
      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // 3 saniye sonra dashboard'a yönlendir
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Şifre Değiştir</CardTitle>
        <CardDescription>
          Güvenliğiniz için güçlü bir şifre seçiniz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Şifreniz başarıyla güncellendi! Dashboard'a yönlendiriliyorsunuz...
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mevcut Şifre</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                placeholder="Mevcut şifrenizi giriniz"
                required
                disabled={loading || success}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                disabled={loading || success}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Yeni Şifre</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                placeholder="Yeni şifrenizi giriniz"
                required
                disabled={loading || success}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                disabled={loading || success}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Şifre en az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Yeni şifrenizi tekrar giriniz"
                required
                disabled={loading || success}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                disabled={loading || success}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || success}
              className="flex-1"
            >
              {loading ? "Güncelleniyor..." : success ? "Güncellendi" : "Şifreyi Güncelle"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading || success}
            >
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

