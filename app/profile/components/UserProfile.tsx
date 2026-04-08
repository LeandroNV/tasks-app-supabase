"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Key, LogOut, Mail, Phone, User } from "lucide-react";

import { useRouter } from "next/navigation";

import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import AccountForm from "./AccountForm";
import { getImageUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { sendRecoveryEmail } from "@/actions/auth/auth";

// Función para obtener las iniciales del nombre
export const getInitials = (name: string | null) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export interface UserProfileData {
  id: string;
  updated_at: string | null;
  created_at: string | null;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone?: string | null;
}

interface UserProfileProps {
  onEditProfile?: () => void;
  onLogout?: () => void;
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
  onEditProfile,
  onLogout,
  className = "",
}) => {
  const { user, isLoading, getUserData } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(
    user as UserProfileData,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
    if (onEditProfile) onEditProfile();
  };

  const handleChangePassword = async () => {
    if (!profile?.email) return;
    const res = await sendRecoveryEmail({ email: profile.email });
    if (res.success) {
      toast.success(res.message, { duration: 3000 });
    } else {
      toast.error(res.message, { duration: 3000 });
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    if (onLogout) onLogout();
    router.replace("/");
  };

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  if (isLoading) {
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardHeader>
          <CardTitle className="text-xl">Perfil no encontrado</CardTitle>
          <CardDescription>
            No se pudo cargar la información del perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              El perfil de usuario no está disponible en este momento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`w-full max-w-md ${className}`}>
        <CardContent className="space-y-6 pt-6">
          {/* Información del usuario */}
          <div>
            <div className="flex flex-col justify-center items-center">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                {profile.avatar_url ? (
                  <Image
                    src={getImageUrl(profile.avatar_url)}
                    alt={profile.name || "Usuario"}
                    className="object-cover"
                    width={1000}
                    height={1000}
                  />
                ) : (
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            <div className="flex-1 text-center mt-4">
              <h3 className="text-xl font-semibold">
                {profile.name || "Usuario sin nombre"}
              </h3>
              <div className="flex flex-col items-center justify-center gap-2 mt-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">
                    {profile.email || "Sin email"}
                  </span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones del perfil */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider text-center lg:text-left">
              Cuenta
            </h4>

            <div className="grid gap-4">
              <Button
                variant="outline"
                className="w-full justify-start h-14"
                onClick={handleEditClick}
              >
                <Edit className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Editar perfil</div>
                  <div className="text-xs text-muted-foreground">
                    Actualiza tu nombre y/o avatar
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-14"
                onClick={handleChangePassword}
              >
                <Key className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Cambiar contraseña</div>
                  <div className="text-xs text-muted-foreground">
                    Establece una nueva contraseña segura
                  </div>
                </div>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-start h-14 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Cerrar sesión</div>
                  <div className="text-xs text-muted-foreground">
                    Salir de tu cuenta actual
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>
              Realiza cambios en tu perfil aquí. Haz click en el botón
              "Actualizar Perfil" para guardar los cambios.
            </DialogDescription>
          </DialogHeader>
          <AccountForm
            user={profile}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              getUserData();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserProfile;
