"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  LayoutDashboard,
  Warehouse,
  Users,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  Bell,
  Package,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Moon,
  Sun,
  MapPin,
  BarChart3,
  Home,
  Car,
  Key,
} from "lucide-react";
import { signOut } from "@/modules/auth/actions/auth";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { title: "Anasayfa", href: "/dashboard", icon: LayoutDashboard },
  { title: "İş Emirleri", href: "/is-emri", icon: ClipboardList },
  { title: "Bildirimler", href: "/notifications", icon: Bell },
  { title: "Depo", href: "/depo", icon: Warehouse, adminOnly: true },
  { title: "Müşteriler", href: "/musteri", icon: Users, adminOnly: true },
  { title: "Araç Bakım", href: "/arac-bakim", icon: Car, adminOnly: true },
  { title: "Personel", href: "/calisanlar", icon: User, adminOnly: true },
];

// Araç kullanım raporu menü öğesi (sadece yönetici roller için)
const vehicleReportItem: NavItem = {
  title: "Araç Kullanım Raporu",
  href: "/arac-bakim/kullanim-raporu",
  icon: BarChart3,
  adminOnly: true,
};

// Kullanıcı menüsü (admin değilse)
const userNavItems: NavItem[] = [
  { title: "İş Emirlerim", href: "/dashboard/work-orders", icon: ClipboardList },
  { title: "Zimmetlerim", href: "/dashboard/my-assignments", icon: Package },
];

const adminItems: NavItem[] = [
  { title: "Kullanıcılar", href: "/admin/users", icon: Users },
  { title: "Kategoriler", href: "/admin/categories", icon: Package },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCollapsed, setIsCollapsed] = useState(true); // Mobilde varsayılan kapalı
  const [isMobile, setIsMobile] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Admin yetkisi olan roller
  const adminRoles = ["admin", "yonetici"];
  const isAdmin = adminRoles.includes(role);
  
  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  // Mobil kontrolü
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true); // Mobilde her zaman kapalı başla
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // localStorage'dan sidebar durumunu yükle (sadece desktop için)
  useEffect(() => {
    if (!isMobile) {
      const savedState = localStorage.getItem("sidebarCollapsed");
      if (savedState !== null) {
        setIsCollapsed(savedState === "true");
      }
    }
  }, [isMobile]);

  // Sidebar durumunu localStorage'a kaydet (sadece desktop için)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
    }
  }, [isCollapsed, isMobile]);

  // Kullanıcı profilini yükle
  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email, avatar_url")
          .eq("id", user.id)
          .single();
        setUserProfile(profile);
      }
    };
    loadProfile();
  }, []);

  const sidebarWidth = isCollapsed ? "w-20" : "w-64";
  const logoSize = isCollapsed ? 60 : 88;

  return (
    <>
      {/* Mobil Hamburger Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 text-white p-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
          aria-label="Menu"
        >
          {isCollapsed ? (
            <Menu className="h-6 w-6" />
          ) : (
            <X className="h-6 w-6" />
          )}
        </button>
      )}

      {/* Overlay - mobil için */}
      {!isCollapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 lg:z-auto flex h-full flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-r border-gray-700/50 shadow-2xl transition-all duration-300 ease-in-out",
          isMobile ? (isCollapsed ? "-translate-x-full" : "translate-x-0 w-64") : sidebarWidth,
          !isMobile && (isCollapsed ? "lg:w-20" : "lg:w-64")
        )}
      >
        {/* Logo ve Toggle */}
        <div className="flex h-16 md:h-20 lg:h-24 items-center justify-between border-b border-gray-700/50 px-3 md:px-4">
          {!isCollapsed && (
            <Link
              href={role === "admin" ? "/admin/dashboard" : "/dashboard"}
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
              onClick={() => isMobile && setIsCollapsed(true)}
            >
              <Image
                src="/logo-aem.png"
                alt="Logo"
                width={isMobile ? 64 : logoSize}
                height={isMobile ? 64 : logoSize}
                className="object-contain drop-shadow-lg"
              />
            </Link>
          )}
          {isCollapsed && !isMobile && (
            <Link
              href={role === "admin" ? "/admin/dashboard" : "/dashboard"}
              className="flex items-center justify-center"
            >
              <Image
                src="/logo-aem.png"
                alt="Logo"
                width={logoSize}
                height={logoSize}
                className="object-contain drop-shadow-lg"
              />
            </Link>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          )}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm md:text-base font-medium transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 scale-[1.02]"
                    : "text-gray-300 hover:bg-gray-800/70 hover:text-white hover:scale-[1.01] hover:shadow-md",
                  isPending && pathname !== item.href && "opacity-50"
                )}
                title={isCollapsed ? item.title : undefined}
                onClick={(e) => {
                  if (isMobile) {
                    setIsCollapsed(true);
                  }
                  if (item.href !== pathname) {
                    startTransition(() => {
                      router.push(item.href);
                    });
                  }
                }}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 animate-pulse" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                    isActive && "drop-shadow-lg"
                  )}
                />
                {!isCollapsed && (
                  <span className="relative z-10 flex-1">{item.title}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="absolute right-2 h-2 w-2 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}
          {role === "user" && (
            <>
              <div className="my-3 border-t border-gray-800/50" />
              {!isCollapsed && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </div>
              )}
              {userNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                        : "text-gray-300 hover:bg-gray-800/70 hover:text-white",
                      isPending && pathname !== item.href && "opacity-50"
                    )}
                    title={isCollapsed ? item.title : undefined}
                    onClick={(e) => {
                      if (item.href !== pathname) {
                        startTransition(() => {
                          router.push(item.href);
                        });
                      }
                    }}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                );
              })}
            </>
          )}

          {isAdmin && (
            <>
              <div className="my-3 border-t border-gray-800/50" />
              {!isCollapsed && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Settings className="h-3 w-3" />
                  Admin Panel
                </div>
              )}
              {/* Araç Kullanım Raporu */}
              {(() => {
                const Icon = vehicleReportItem.icon;
                const isActive =
                  pathname === vehicleReportItem.href ||
                  pathname.startsWith(vehicleReportItem.href + "/");
                return (
                  <Link
                    href={vehicleReportItem.href}
                    prefetch={true}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30"
                        : "text-gray-300 hover:bg-gray-800/70 hover:text-white",
                      isPending && pathname !== vehicleReportItem.href && "opacity-50"
                    )}
                    title={isCollapsed ? vehicleReportItem.title : undefined}
                    onClick={(e) => {
                      if (vehicleReportItem.href !== pathname) {
                        startTransition(() => {
                          router.push(vehicleReportItem.href);
                        });
                      }
                    }}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{vehicleReportItem.title}</span>}
                  </Link>
                );
              })()}
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30"
                        : "text-gray-300 hover:bg-gray-800/70 hover:text-white",
                      isPending && pathname !== item.href && "opacity-50"
                    )}
                    title={isCollapsed ? item.title : undefined}
                    onClick={(e) => {
                      if (item.href !== pathname) {
                        startTransition(() => {
                          router.push(item.href);
                        });
                      }
                    }}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Kullanıcı Profili ve Çıkış */}
        <div className="border-t border-gray-800/50 p-3 space-y-2">
          {/* Kullanıcı Profil Bilgisi */}
          {!isCollapsed && userProfile && (
            <div className="px-3 py-2 rounded-lg bg-gray-800/30 mb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-semibold shadow-lg">
                  {userProfile.full_name
                    ? userProfile.full_name.charAt(0).toUpperCase()
                    : userProfile.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {userProfile.full_name || "Kullanıcı"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {userProfile.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Şifre Değiştir Link */}
          <Link
            href="/auth/change-password"
            prefetch={true}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-2",
              pathname === "/auth/change-password"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-300 hover:bg-gray-800/70 hover:text-white"
            )}
            title={isCollapsed ? "Şifre Değiştir" : undefined}
            onClick={() => {
              if (isMobile) {
                setIsCollapsed(true);
              }
              if ("/auth/change-password" !== pathname) {
                startTransition(() => {
                  router.push("/auth/change-password");
                });
              }
            }}
          >
            <Key className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Şifre Değiştir</span>}
          </Link>

          {/* Çıkış Butonu */}
          <form action={signOut}>
            <button
              type="submit"
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-red-600/20 hover:text-red-400 border border-transparent hover:border-red-600/30",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? "Çıkış Yap" : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 transition-transform group-hover:rotate-12" />
              {!isCollapsed && <span>Çıkış Yap</span>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
