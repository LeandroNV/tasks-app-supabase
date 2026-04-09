'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';

import { Loader2 } from 'lucide-react';
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileInput } from '@/components/FileInput';
import type { Task } from '@/types/task';
import { createTask } from '@/actions/tasks/create-task';
import { updateTask } from '@/actions/tasks/update-task';
import toast from 'react-hot-toast';

export type { Task };

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onSuccess: () => void;
}

const taskSchema = z.object({
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().optional(),
    status: z.enum(['todo', 'in-progress', 'review', 'done'] as const),
    priority: z.enum(['low', 'medium', 'high'] as const),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskForm({ isOpen, onClose, task, onSuccess }: TaskFormProps) {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);
    const wasDialogOpenRef = useRef(false);
    const previousTaskIdRef = useRef<string | null>(null);

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
        },
    });

    useEffect(() => {
        if (!isOpen) {
            wasDialogOpenRef.current = false;
            return;
        }

        const justOpened = !wasDialogOpenRef.current;
        wasDialogOpenRef.current = true;

        const taskId = task?.id ?? null;
        const switchedTaskWhileOpen =
            previousTaskIdRef.current !== null &&
            taskId !== null &&
            previousTaskIdRef.current !== taskId;

        if (justOpened || switchedTaskWhileOpen) {
            setFileInputKey((k) => k + 1);
        }
        previousTaskIdRef.current = taskId;

        if (task) {
            form.reset({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
            });
            setSelectedFile(null);
            setRemoveImage(false);
        } else {
            form.reset({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
            });
            setSelectedFile(null);
            setRemoveImage(false);
        }
    }, [task, form, isOpen]);

    const onSubmit = async (data: TaskFormValues) => {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description || '');
            formData.append('status', data.status);
            formData.append('priority', data.priority);

            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            if (task) {
                formData.append('id', task.id);
                formData.append('existingImage', task.image || '');
                if (removeImage) formData.append('removeImage', 'true');
            }

            const result = task
                ? await updateTask(formData)
                : await createTask(formData);

            if (!result.ok) {
                toast.error(result.error, { duration: 4000 });
                return;
            }

            toast.success(task ? 'Tarea actualizada' : 'Tarea creada', {
                duration: 2500,
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error('No se pudo guardar la tarea', { duration: 4000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="lg:w-xl md:w-full w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{task ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
                    <FieldGroup className="gap-4">
                        <Controller
                            control={form.control}
                            name="title"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid || undefined} data-disabled={loading || undefined}>
                                    <FieldLabel htmlFor="task-title">Título</FieldLabel>
                                    <Input
                                        {...field}
                                        id="task-title"
                                        placeholder="Título de la tarea"
                                        disabled={loading}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="description"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid || undefined} data-disabled={loading || undefined}>
                                    <FieldLabel htmlFor="task-description">Descripción</FieldLabel>
                                    <Textarea
                                        {...field}
                                        id="task-description"
                                        placeholder="Describe lo que hay que hacer..."
                                        rows={3}
                                        disabled={loading}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="status"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid || undefined} data-disabled={loading || undefined}>
                                        <FieldLabel htmlFor="task-status">Estado</FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={loading}
                                        >
                                            <SelectTrigger id="task-status" aria-invalid={fieldState.invalid}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todo">Pendiente</SelectItem>
                                                <SelectItem value="in-progress">En curso</SelectItem>
                                                <SelectItem value="review">En revisión</SelectItem>
                                                <SelectItem value="done">Completado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="priority"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid || undefined} data-disabled={loading || undefined}>
                                        <FieldLabel htmlFor="task-priority">Prioridad</FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={loading}
                                        >
                                            <SelectTrigger id="task-priority" aria-invalid={fieldState.invalid}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Baja</SelectItem>
                                                <SelectItem value="medium">Media</SelectItem>
                                                <SelectItem value="high">Alta</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />
                        </div>

                        <Field>
                            <FileInput
                                key={fileInputKey}
                                accept="image/jpeg, image/png, image/gif, image/webp"
                                multiple={false}
                                onFilesSelected={(files) => {
                                    if (files.length > 0) {
                                        const f = files[0];
                                        const isRemotePlaceholder =
                                            f.type === "image/remote" ||
                                            (f.size === 0 && !f.name);
                                        if (isRemotePlaceholder) {
                                            setSelectedFile(null);
                                            setRemoveImage(false);
                                            return;
                                        }
                                        setSelectedFile(f);
                                        setRemoveImage(false);
                                    } else {
                                        setSelectedFile(null);
                                        if (task?.image) setRemoveImage(true);
                                    }
                                }}
                                initialImageUrl={task?.image || undefined}
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="pt-4">
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 data-icon="inline-start" className="animate-spin" />}
                                {task ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
