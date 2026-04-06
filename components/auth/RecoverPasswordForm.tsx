"use client"

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { AuthFormProps } from "./AuthForm";
import { sendRecoveryEmail } from "@/actions/auth/auth";


const RecoverPasswordForm = ({ setTypeSelected }: AuthFormProps) => {

    const [isLoading, setisLoading] = useState<boolean>(false)

    // ============ Form ============
    const formSchema = z.object({
        email: z
            .string()
            .min(1, { message: "Este campo es requerido" })
            .email({
                message:
                    "Por favor ingresa un correo válido. Ejemplo: user@mail.com",
            }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ''
        }
    })

    const { handleSubmit, control } = form;

    // ============ Password Recovery ===========
    const onSubmit = async (user: z.infer<typeof formSchema>) => {
        setisLoading(true); 

        try {
      
            const res = await sendRecoveryEmail(user)

            if(res.success){
                toast.success(res.message, {duration: 2500})
                setTypeSelected('sign-in')
            }
            

        } catch (error: any) {
            toast.error(error.message, { duration: 2500 });
        } finally {
            setisLoading(false);
        }
    }

    return (
        <div>
            <div className="w-full backdrop-blur-xl py-6 rounded-4xl">
                <div className="rounded-xl px-6">
                    <div className="text-center">
                        <h1 className="lg:text-5xl md:text-4xl text-3xl font-semibold text-center my-4">
                            Recuperar Contraseña
                        </h1>
                        <p className="text-sm text-muted-foreground mb-8">
                            Te enviaremos un correo para recuperar tu contraseña
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-2">
                            <Controller
                                control={control}
                                name="email"
                                render={({ field, fieldState }) => (
                                    <Field
                                        data-invalid={fieldState.invalid}
                                        className="mb-3"
                                    >
                                        <FieldLabel htmlFor="email">
                                            Correo
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="email"
                                            placeholder="name@example.com"
                                            type="email"
                                            autoComplete="email"
                                            disabled={isLoading}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />

                            <Button
                                className="my-6"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading && (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Recuperar
                            </Button>
                        </div>
                    </form>

                    {/* ========== Volver ========= */}
                    <p className="text-center text-sm text-white mt-3">
                        <button
                            type="button"
                            onClick={() => setTypeSelected("sign-in")}
                            className="inline border-0 bg-transparent p-0 font-inherit text-inherit underline underline-offset-4 hover:text-primary cursor-pointer"
                        >
                            Volver
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RecoverPasswordForm;