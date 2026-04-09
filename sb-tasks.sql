-- Crear tipos ENUM para status y priority
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'review', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- Crear la tabla tasks
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image TEXT
);

-- Crear índices para mejorar el rendimiento de consultas frecuentes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver solo sus propias tareas
CREATE POLICY "Users can view own tasks" 
ON tasks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propias tareas
CREATE POLICY "Users can insert own tasks" 
ON tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propias tareas
CREATE POLICY "Users can update own tasks" 
ON tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propias tareas
CREATE POLICY "Users can delete own tasks" 
ON tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- =============== BUCKET PARA IMAGENES DE TAREAS ===============

-- Insertar nuevo bucket para imágenes de tareas
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'task-images',
  'task-images',
  true, -- Público para que los usuarios puedan ver las imágenes
  false,
  25242880, -- 25MB límite por archivo
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Política para subir archivos: Solo el dueño puede subir
CREATE POLICY "Users can upload their own task images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para ver archivos: Cualquiera puede ver
CREATE POLICY "Anyone can view task images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'task-images');

-- Política para actualizar: Solo el dueño puede actualizar
CREATE POLICY "Users can update their own task images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'task-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para eliminar: Solo el dueño puede eliminar
CREATE POLICY "Users can delete their own task images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'task-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);