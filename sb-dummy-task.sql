-- Insertar 40 tareas de ejemplo
INSERT INTO tasks (title, description, status, priority, user_id) VALUES
-- Tareas pendientes (todo)
('Planificar reunión semanal', 'Preparar agenda y objetivos para la reunión del equipo', 'todo', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Actualizar documentación', 'Revisar y actualizar la documentación del proyecto', 'todo', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Investigar nuevas tecnologías', 'Buscar herramientas para mejorar el workflow', 'todo', 'low', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Revisar pull requests', 'Evaluar los PRs pendientes en GitHub', 'todo', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Crear presentación', 'Diseñar slides para la presentación del cliente', 'todo', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Organizar archivos', 'Clasificar y organizar documentos del proyecto', 'todo', 'low', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Configurar entorno', 'Preparar entorno de desarrollo para nuevo feature', 'todo', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Revisar bugs', 'Identificar bugs reportados en producción', 'todo', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Escribir tests', 'Crear tests unitarios para módulo nuevo', 'todo', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Planificar sprint', 'Definir tareas y objetivos para el próximo sprint', 'todo', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),

-- Tareas en progreso (in-progress)
('Desarrollar feature de autenticación', 'Implementar sistema de login con JWT', 'in-progress', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Diseñar interfaz dashboard', 'Crear wireframes y mockups del panel', 'in-progress', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Optimizar consultas SQL', 'Mejorar rendimiento de consultas a la base de datos', 'in-progress', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Integrar API de terceros', 'Conectar con servicio de pagos externo', 'in-progress', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Refactorizar código legacy', 'Mejorar estructura de módulo antiguo', 'in-progress', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Crear sistema de notificaciones', 'Implementar envío de emails y push notifications', 'in-progress', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Configurar CI/CD', 'Automatizar despliegues con GitHub Actions', 'in-progress', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Desarrollar módulo de reportes', 'Crear generador de reportes en PDF', 'in-progress', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Implementar buscador', 'Crear sistema de búsqueda con filtros', 'in-progress', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Crear API endpoints', 'Desarrollar endpoints REST para nuevo módulo', 'in-progress', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),

-- Tareas en revisión (review)
('Revisar implementación de cache', 'Evaluar sistema de cache implementado', 'review', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Verificar seguridad endpoints', 'Auditar vulnerabilidades en API', 'review', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Testear responsive design', 'Comprobar adaptabilidad en diferentes dispositivos', 'review', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Revisar documentación técnica', 'Validar precisión de documentación escrita', 'review', 'low', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Auditar accesibilidad', 'Verificar cumplimiento de estándares WCAG', 'review', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Evaluar performance', 'Analizar métricas de rendimiento', 'review', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Revisar código de feature', 'Code review de implementación reciente', 'review', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Validar integración continua', 'Verificar que CI/CD funciona correctamente', 'review', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Comprobar backups', 'Verificar sistema de backup y recuperación', 'review', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Revisar UX/UI', 'Evaluar experiencia de usuario final', 'review', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),

-- Tareas completadas (done)
('Actualizar dependencias', 'Actualizar librerías a sus últimas versiones', 'done', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Configurar base de datos', 'Instalar y configurar PostgreSQL', 'done', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Crear logo', 'Diseñar identidad visual para el proyecto', 'done', 'low', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Configurar dominio', 'Registrar y configurar dominio del sitio', 'done', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Implementar analytics', 'Integrar Google Analytics al sitio web', 'done', 'low', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Configurar SSL', 'Instalar certificado SSL para HTTPS', 'done', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Crear página de contacto', 'Desarrollar formulario de contacto funcional', 'done', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Configurar monitorización', 'Implementar sistema de alertas y logs', 'done', 'high', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Optimizar imágenes', 'Comprimir y optimizar recursos gráficos', 'done', 'low', '418ed23d-d5f9-4353-974d-fa4347ab4ccb'),
('Configurar correos', 'Establecer servicio de envío de emails', 'done', 'medium', '418ed23d-d5f9-4353-974d-fa4347ab4ccb');