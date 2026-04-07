"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/actions/auth/auth";
import { useRouter } from "next/navigation";

const UpdatePasswordForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter()

  const formSchema = z
    .object({
      password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit, control } = form;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const res = await updatePassword(data)

      if(res.success) {
        toast.success(res.message, {
          duration: 2500
        })
        router.push('/profile')
      } 
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Algo salió mal";
      toast.error(message, { duration: 2500 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md backdrop-blur-xl bg-background py-6 rounded-4xl lg:border lg:border-white/50">
      <div className="rounded-xl px-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-center my-4">
            Nueva Contraseña
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mb-3">
                  <FieldLabel htmlFor="update-password">
                    Nueva Contraseña
                  </FieldLabel>
                  <Input
                    {...field}
                    id="update-password"
                    type="password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mb-3">
                  <FieldLabel htmlFor="update-password-confirm">
                    Confirmar Contraseña
                  </FieldLabel>
                  <Input
                    {...field}
                    id="update-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button className="mt-6" type="submit" disabled={isLoading}>
              {isLoading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Actualizar Contraseña
            </Button>

            <Link
              href="/profile"
              className="text-center text-sm text-white mt-3 underline underline-offset-4 hover:text-primary cursor-pointer"
            >
              Volver
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;
