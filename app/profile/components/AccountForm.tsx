"use client";

import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { CircleUserRound, Loader2, LoaderCircle, Pencil } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import PhoneInput from "@/components/PhoneInput";
import { updateAvatar } from "@/actions/auth/update-avatar";
import { updateProfile } from "@/actions/auth/update-profile";
const profileSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.email().optional(),
  avatar_url: z.string().nullable().optional(),
  phone: z.string().optional().nullable(),
  country_code: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountForm({
  user,
  onSuccess,
}: {
  user: any;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatar_url || null,
  );
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      avatar_url: user?.avatar_url || null,
      phone: user?.phone || "",
      country_code: user?.country_code || "VE",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        avatar_url: user.avatar_url || null,
        phone: user.phone || "",
        country_code: user.country_code || "VE",
      });
      setAvatarUrl(user.avatar_url || null);
    }
  }, [user, form]);

  async function onSubmit(values: ProfileFormValues) {
    try {
      setLoading(true);

      const res = await updateProfile({
        id: user?.id,
        name: values.name,
        phone: values.phone,
        country_code: values.country_code,
      });

      toast.success("Perfil actualizado.");

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Hubo un error al actualizar el perfil.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // ======== Choose a profile image ========
  const chooseImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato no válido. Use JPG, PNG o WebP.");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen es muy grande. Máximo 5MB.");
      return;
    }
    setIsLoadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id);

      const response = await updateAvatar(formData);

      if (response.publicUrl) {
        setAvatarUrl(response.publicUrl);
        toast.success("Avatar actualizado correctamente");
      }
    } finally {
      setIsLoadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {isLoadingImage ? (
        <div className="flex justify-center items-center">
          <LoaderCircle className="w-14 h-14 animate-spin mb-3" />
        </div>
      ) : (
        <>
          <div className="relative w-26 h-26 mx-auto mb-3">
            {avatarUrl ? (
              <Image
                className="object-cover w-full h-full rounded-full"
                src={avatarUrl}
                width={1000}
                height={1000}
                alt="user-img"
                onError={() => setAvatarUrl("")}
              />
            ) : (
              <CircleUserRound className="w-full h-full" />
            )}

            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div>
                <input
                  id="files"
                  type="file"
                  className="hidden"
                  accept="image/png, image/webp, image/jpeg, image/jpg"
                  onChange={chooseImage}
                  disabled={isLoadingImage}
                />
                <label htmlFor="files">
                  <div className="w-[40px] h-[28px] cursor-pointer rounded-full text-slate-950 bg-white flex justify-center items-center hover:bg-gray-100 transition-colors">
                    {isLoadingImage ? (
                      <LoaderCircle className="w-[18px] h-[18px] animate-spin" />
                    ) : (
                      <Pencil className="w-[18px] h-[18px]" />
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        </>
      )}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FieldGroup>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-disabled data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="account-email">Email</FieldLabel>
                <Input
                  id="account-email"
                  {...field}
                  disabled
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="account-name">Nombre Completo</FieldLabel>
                <Input
                  id="account-name"
                  placeholder="Tu nombre"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="account-phone">
                  Número de Teléfono
                </FieldLabel>
                <PhoneInput
                  id="account-phone"
                  defaultCountryCode={form.getValues("country_code") || "VE"}
                  value={field.value || ""}
                  onChange={field.onChange}
                  onCountryChange={(country) => {
                    form.setValue("country_code", country.code);
                  }}
                  placeholder="Número de teléfono"
                  aria-invalid={fieldState.invalid}
                  error={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>

        <Button type="submit" className="mt-4 w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Guardando..." : "Actualizar Perfil"}
        </Button>
      </form>
    </div>
  );
}
