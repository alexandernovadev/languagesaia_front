import * as React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import {
  menuItems,
  guiaItems,
  generatorItems,
  gamesItems,
  configSettingsItems,
} from "../sidebar-menus";
import { useAuth } from "@/shared/hooks/useAuth";
import { useEnvironment } from "@/shared/hooks/useEnvironment";
import {
  contentLanguageCodes,
  languages as languagesInfo,
  type ContentLanguageCode,
} from "@/utils/common/language";
import { LoginButton } from "../LoginButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { userService } from "@/services/userService";
import { User, LogOut } from "lucide-react";
import { toast } from "sonner";
import packageJson from "../../../../package.json";

const CONTENT_LANGUAGE_OPTIONS = contentLanguageCodes.map((code) => ({
  value: code,
  ...languagesInfo[code],
}));

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function MenuItems({ items }: { items: typeof menuItems }) {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const isActive = (url: string) => {
    if (url === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(url);
  };

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.url);
        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
              <Link to={item.url} onClick={handleClick}>
                <Icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

function SidebarFooterNav() {
  const { user, logout, refreshAccessToken } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const [languageSaving, setLanguageSaving] = useState(false);

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleContentLanguageChange = async (value: string) => {
    if (!user?._id || value === user.language) return;
    try {
      setLanguageSaving(true);
      await userService.updateUser(user._id, {
        language: value as ContentLanguageCode,
      });
      await refreshAccessToken();
      toast.success("Idioma de contenido actualizado", { duration: 1500 });
      window.setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "No se pudo cambiar el idioma");
    } finally {
      setLanguageSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 px-2 py-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Perfil">
            <Link to="/profile" onClick={closeMobile}>
              <User />
              <span>Perfil</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <div className="group-data-[collapsible=icon]:hidden space-y-1.5 px-0.5">
        <Label
          htmlFor="sidebar-content-lang"
          className="text-xs text-muted-foreground"
        >
          Idioma del contenido
        </Label>
        <Select
          value={user?.language === "es" ? "en" : (user?.language ?? "en")}
          onValueChange={(v) => void handleContentLanguageChange(v)}
          disabled={languageSaving || !user?._id}
        >
          <SelectTrigger
            id="sidebar-content-lang"
            className="h-9 w-full text-xs"
            aria-label="Idioma del contenido"
          >
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="top"
            align="start"
            className="w-[var(--radix-select-trigger-width)]"
          >
            {CONTENT_LANGUAGE_OPTIONS.map((lang) => (
              <SelectItem
                key={lang.value}
                value={lang.value}
                className="text-xs"
              >
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Cerrar sesión"
            onClick={() => {
              closeMobile();
              logout();
            }}
          >
            <LogOut />
            <span>Cerrar sesión</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, user } = useAuth();
  const { isDevelopment } = useEnvironment();

  const userDisplayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : (user?.username ?? "");

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <div
            className="flex justify-between"
            onDoubleClick={() => window.location.reload()}
          >
            <div className="relative flex h-8 w-8 items-center justify-center group-data-[collapsible=icon]:hidden">
              <img
                src={isDevelopment ? "/logodev.png" : "/loogo.png"}
                alt="LanguagesAI Logo"
                className="h-8 w-8 object-cover rounded"
              />
              {isAuthenticated &&
                user?.language &&
                languagesInfo[user.language] && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 text-sm leading-none bg-background rounded-full p-0.5 shadow-sm ring-1 ring-sidebar-border"
                    title={languagesInfo[user.language].name}
                  >
                    {languagesInfo[user.language].flag}
                  </span>
                )}
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold">
                {isAuthenticated && userDisplayName
                  ? userDisplayName
                  : "LanguagesAI"}
              </span>
              <span className="text-xs text-muted-foreground">
                v{packageJson.version}
              </span>
            </div>
            <div className="">
              <SidebarTrigger className="h-8 w-8 border-none" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <MenuItems items={menuItems} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Guía</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <MenuItems items={guiaItems} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Generadores</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <MenuItems items={generatorItems} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Juegos</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <MenuItems items={gamesItems} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Configuración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <MenuItems items={configSettingsItems} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          {isAuthenticated && user ? (
            <SidebarFooterNav />
          ) : (
            <div className="px-2 py-2">
              <LoginButton />
            </div>
          )}
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0 overflow-y-auto">
        <div className="flex flex-1 flex-col gap-4 p-4 pb-0 min-w-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
