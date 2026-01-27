# 🗺️ Roadmap - Diario de un Instante

**Versión actual**: v0.5 - Multi-tenant con Invitaciones ✅
**Última actualización**: Enero 2026

---

## 📊 Estado Actual

### v0.5 - Multi-tenant con Sistema de Invitaciones ✅ COMPLETADA

**URL**: https://www.diariodeuninstante.com

- [x] Firebase Auth (email/password)
- [x] Multi-tenant con aislamiento por userId
- [x] Roles (admin/user)
- [x] Sistema de invitaciones
- [x] Sistema de solicitudes de invitación
- [x] Home global (contenido público de todos)
- [x] Panel admin aislado
- [x] Menú responsive

**Ver detalles completos en**: `v0.5-CHANGELOG.md`

---

## 🚀 Roadmap de Versiones

### 📝 v0.5.1 - Autenticación Extendida

**Objetivo**: Más opciones de login y recuperación de cuenta

**Features**:
1. **Google Auth** - Sign in with Google OAuth
2. **Apple Auth** - Sign in with Apple (crítico para iOS)
3. **Magic Links** - Login sin contraseña (enviado por email)
4. **Reset Password** - Flujo de recuperación de contraseña
5. **Verificación de email** - Confirmar email antes de poder usar la cuenta

**Tech**:
- Firebase Google Provider
- Firebase Apple Provider
- Firebase Email Link (passwordless)
- Firebase Password Reset
- Firestore campo `emailVerified`

**Prioridad**: ALTA - Mejora UX significativa

---

### 🎨 v0.5.2 - Personalización de Blogs

**Objetivo**: Cada usuario tenga su blog personalizado

**Features**:
1. **Páginas de perfil** - `/@username` o `/u/username`
2. **Configuración de blog**:
   - Nombre del blog (ej: "El Diario de Juan")
   - Bio / Descripción
   - Foto de perfil
   - Foto de cabecera
   - Tema personalizado (colores, tipografía)
3. **Subdominios** - `username.diariodeuninstante.com` (opcional)
4. **Dominio personalizado** - Usuarios pueden conectar su propio dominio

**Tech**:
- Nuevas rutas: `/[username]` o `/u/[username]`
- Campo `blogConfig` en documento `users`
- Vercel para subdominios wildcards
- Campo `customDomain` en `users`

**Prioridad**: ALTA - Diferenciación clave

---

### 🌐 v0.6 - SOCIAL Y COMPARTIR

**Objetivo**: Hacer el contenido compartible y descubrible

**Features**:
1. **Compartir instante** - Generar imagen bonita para compartir
   - OG Image automática por instante
   - Twitter Card con diseño custom
   - Imagen descargable para Instagram/Stories
2. **RSS feeds**:
   - `/rss` - Feed global de todos los usuarios
   - `/@username/rss` - Feed por usuario
   - `/area/trabajo/rss` - Feed por área
3. **Newsletter**:
   - Suscripción por email
   - Resumen semanal de instantes públicos
   - Usar Resend o SendGrid
4. **Comentarios** - Sistema de comentarios en instantes públicos
   - Threaded comments (respuestas)
   - Moderación por autor del instante
5. **Reacciones** - Like/corazón en instantes públicos

**Tech**:
- `@vercel/og` para generar imágenes OG
- `rss` package para feeds RSS
- Resend/SendGrid API para emails
- Firestore nueva colección: `comments`
- Firestore campo `reactions` array en instantes
- API routes para RSS: `/api/rss`, `/api/[username]/rss`

**Prioridad**: MEDIA - Crece descubribility

---

### 📅 v0.7 - CONTENIDO AVANZADO

**Objetivo**: Más posibilidades de expresión

**Features**:
1. **Programar publicación** - Escribir hoy, publicar mañana
   - Selector de fecha/hora de publicación
   - Queue de publicaciones programadas
   - Email de confirmación cuando se publique
2. **Adjuntar imágenes** - Firebase Storage
   - Subir 1-5 fotos por instante
   - Galería embebida en el instante
   - Lazy loading de imágenes
   - Responsive (móvil + escritorio)
3. **Etiquetas/tags** - Sistema de tags transversales
   - Tags además del área (ej: #reflexión, #meta, #2026)
   - Página de tag: `/tag/reflexion`
   - Nube de tags en admin
4. **Plantillas por área** - Preguntas guía
   - Cada área tiene preguntas personalizadas
   - Ej: Salud → "¿Qué comiste hoy?", "¿Cuánto dormiste?"
   - Ayuda a combatir blank page syndrome

**Tech**:
- Firebase Storage para imágenes
- Vercel Cron Jobs para publicaciones programadas
- Campo `tags` (array) en instantes
- Campo `scheduledFor` (Timestamp) en instantes
- Campo `templates` en configuración de áreas
- Optimización de imágenes con Next/Image

**Prioridad**: MEDIA - Enriquece el contenido

---

### 📊 v0.8 - ANALYTICS MEJORADO

**Objetivo**: Insights más profundos

**Features**:
1. **Resumen semanal/mensual**:
   - Email automático con resumen
   - Página con insights destacados
   - Comparativa con período anterior
2. **Gráficas comparativas**:
   - Evolución temporal por área
   - Heatmap de actividad (tipo GitHub)
   - Streaks (días consecutivos escribiendo)
3. **Exportar datos**:
   - Backup completo (JSON)
   - Export Markdown (para blog/Notion)
   - Export CSV (para Excel/Sheets)

**Tech**:
- Vercel Cron Jobs para resúmenes
- Resend API para emails
- Chart.js o Recharts para gráficas
- API routes: `/api/export/json`, `/api/export/md`
- Campos de estadísticas calculadas

**Prioridad**: MEDIA - Valor retención

---

### 🛠️ v0.9 - ADMIN AVANZADO

**Objetivo**: Mejor gestión de contenido

**Features**:
1. **Dashboard mejorado**:
   - Gráficas en panel admin
   - KPIs principales (instantes este mes, áreas activas, etc.)
   - Activity feed reciente
2. **Bulk actions**:
   - Seleccionar múltiples instantes
   - Eliminar, mover de área, cambiar privacidad en lote
   - Select All / Deselect All
3. **Historial de cambios**:
   - Ver versiones anteriores de un instante
   - Diff entre versiones (qué cambió)
   - Revertir a versión anterior
4. **Papelera (Soft Delete)**:
   - Recuperar instantes eliminados
   - Vaciar papelera
   - Auto-delete después de 30 días

**Tech**:
- Campo `deletedAt` (Timestamp) en lugar de delete real
- Nueva colección `historial` para versiones
- Query filtering: `where('deletedAt', '==', null)`
- Checkbox UI para bulk actions
- Diff viewer para versiones

**Prioridad**: BAJA - Productivity power user

---

### 🔌 v0.10 - INTEGRACIONES

**Objetivo**: Conectar con otros servicios

**Features**:
1. **Notion sync**:
   - Sincronizar instantes con Notion database
   - Two-way sync (edición en Notion → Diario)
   - Mapeo de campos (área → propiedad Notion)
2. **Google Calendar**:
   - Ver instantes en calendario
   - Crear instante desde calendario
   - Integración con Google Calendar API
3. **Telegram bot**:
   - Crear instantes desde Telegram
   - Comando `/instante` abre wizard
   - Responde con preguntas (área, tipo, contenido)
4. **Webhooks/API**:
   - Webhooks para Zapier/Make
   - Eventos: instante creado, publicado, etc.
   - Autenticación con API keys

**Tech**:
- Notion API
- Google Calendar API
- Telegram Bot API (long polling)
- Webhooks system con signatures
- API Keys en Firestore

**Prioridad**: BAJA - Power user features

---

### 🎮 v1.0 - GAMIFICACIÓN + API PÚBLICA

**Objetivo**: Engagement y ecosistema

**Features**:
1. **Logros/badges**:
   - "Primer instante" 🌱
   - "100 instantes" 💯
   - "Todas las áreas" 🌟
   - "30 días streak" 🔥
   - "Early adopter" 👑
2. **Objetivos**:
   - "Quiero escribir 3 veces por semana"
   - "Un instante por área"
   - Seguimiento de progreso
3. **Puntos por consistencia**:
   - +1 punto por instante
   - +5 puntos por streak de 7 días
   - Leaderboard global (opt-in)
4. **API pública**:
   - REST API para desarrolladores
   - Endpoints: GET /instantes, POST /instantes, etc.
   - Autenticación con API keys
5. **Documentación API**:
   - Swagger/OpenAPI
   - Ejemplos de uso
   - Postman collection

**Tech**:
- Sistema de `achievements` en Firestore
- Sistema de `goals` en Firestore
- Calculadora de puntos
- Next.js API Routes
- swagger-jsdoc para documentación
- API Keys management

**Prioridad**: MEDIA - Engagement y ecosistema

---

## 📅 Timeline Estimado

| Versión | Prioridad | Estimado | Estado |
|---------|-----------|----------|--------|
| v0.5.1 - Auth Extendida | ALTA | 1-2 semanas | ⏳ Pendiente |
| v0.5.2 - Personalización | ALTA | 2-3 semanas | ⏳ Pendiente |
| v0.6 - Social | MEDIA | 2-3 semanas | ⏳ Pendiente |
| v0.7 - Contenido Avanzado | MEDIA | 3-4 semanas | ⏳ Pendiente |
| v0.8 - Analytics | MEDIA | 2 semanas | ⏳ Pendiente |
| v0.9 - Admin Avanzado | BAJA | 2 semanas | ⏳ Pendiente |
| v0.10 - Integraciones | BAJA | 3-4 semanas | ⏳ Pendiente |
| v1.0 - Gamificación + API | MEDIA | 3-4 semanas | ⏳ Pendiente |

**Total estimado a v1.0**: ~18-26 semanas (4-6 meses)

---

## 🎯 Estrategia de Desarrollo

### Fase 1: Fundamentos (v0.5.1 - v0.5.2)
**Enfoque**: Completar el core multi-tenant

Por qué primero:
- Autenticación mejorada es base para todo
- Personalización diferencía la plataforma
- Necesario antes de crecer

### Fase 2: Crecimiento (v0.6 - v0.7)
**Enfoque**: Atraer y retener usuarios

Por qué después:
- Social/share ayuda a descubrir la plataforma
- Contenido avanzado enriquece la experiencia
- Más contenido = más tráfico

### Fase 3: Retención (v0.8 - v0.9)
**Enfoque**: Mantener usuarios engaged

Por qué después:
- Analytics da insights para mejorar
- Admin avanzado mejora power user experience
- Usuario establecido antes de optimizar

### Fase 4: Escala (v0.10 - v1.0)
**Enfoque**: Ecosistema y lock-in

Por qué al final:
- Integraciones requieren base estable
- Gamificación más efectiva con contenido previo
- API atrae desarrolladores

---

## 🔄 Modelo de Desarrollo

### Criterios para avanzar de versión
1. **Features completadas**: Todos los items de la versión
2. **Testing**: QA manual + automated tests
3. **Documentación**: Guías actualizadas
4. **Producción**: Deploy exitoso sin bugs críticos
5. **Feedback**: Al menos 5 usuarios usaron features anteriores

### Velocidad de lanzamiento
- **Versiones menores** (v0.5.1, v0.5.2): 1-2 semanas
- **Versiones mayores** (v0.6, v0.7): 2-4 semanas
- **Milestone** (v1.0): 4-6 semanas

### Backlog rule
Si una versión tiene features que dependen de otra:
- **Dependencias primero**: Si v0.7 necesita v0.5.2, v0.5.2 tiene prioridad
- **Parallel development**: Si no hay dependencias, pueden trabajarse en paralelo
- **Cut scope**: Si una versión está tomando >2x el tiempo estimado, mover features a la siguiente

---

## 💡 Ideas Futuras (Backlog)

Estas ideas están fuera del roadmap actual pero podrían considerarse:

### v1.1 - Colaborativo
- Instantes colaborativos (múltiples autores)
- Shared diaries (parejas, equipos)
- Comments tipo Reddit (upvotes, hilos anidados)

### v1.2 - Audio/Video
- Notas de voz (transcripción automática)
- Videodiario (grabación corta + transcripción)
- Podcast automático desde instantes

### v1.3 - AI/ML
- AI suggestions para continuar instante
- Sentiment analysis (¿estoy feliz/estresado?)
- Smart tags (tags automáticos por contenido)
- Insights: "Escribes más de trabajo cuando llueve"

### v1.4 - Comunidad
- Foro tipo Discord
- Grupos por área (grupo de salud)
- Challenges semanales ("7 días de gratitud")
- Mentor matching (usuarios veteranos → nuevos)

### v1.5 - Monetización
- Planes Free/Premium/Enterprise
- Marketplace de plantillas
- Affiliate program
- White-label para empresas

---

## 📈 Métricas de Éxito

### Por versión
- **v0.5.1**: Tasa de login exitoso >95%
- **v0.5.2**: >50% usuarios configuran su blog
- **v0.6**: +30% tráfico orgánico (compartir)
- **v0.7**: +20% instantes con imágenes
- **v0.8**: >60% usuarios abren resumen semanal
- **v1.0**: 100 usuarios activos mensuales

### North Star Metrics
- **DAU/MAU**: Sticky rate (daily active / monthly active)
  - Meta: >30% (usuarios usan 10+ días al mes)
- **Retention**: Cohort retention
  - Meta: >50% retorno después de 1 mes
- **Creation Rate**: Instantes por usuario por semana
  - Meta: >2 instantes/semana

---

## 🛠️ Stack Tecnológico Futuro

### Ya en uso
- Next.js 14
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS
- TypeScript

### Por añadir
- **Vercel Cron** - Jobs programados
- **Resend/SendGrid** - Emails transaccionales
- **@vercel/og** - OG images
- **Chart.js/Recharts** - Gráficas
- **Notion API** - Integración
- **Telegram Bot API** - Bot
- **Swagger** - API docs

### Infraestructura
- **Vercel** - Hosting (continuar)
- **Firebase** - Backend (continuar)
- **GitHub Actions** - CI/CD (si crece el equipo)
- **Playwright** - E2E testing

---

## 📝 Notas

### Principios de diseño
1. **Simple antes que complejo**: Cada feature debe tener MVP simple
2. **Mobile-first**: Todo debe funcionar perfecto en móvil
3. **Performance**: <3s First Contentful Paint
4. **Accessibility**: WCAG AA compliant
5. **Privacy-first**: Por defecto privado, opt-in público

### Deletion policy
- Usuario puede borrar su cuenta y todos sus datos
- Datos eliminados en 30 días (soft delete)
- Export antes de borrar (GDPR compliance)

### Open source consideration
- Código podría ser open source en v1.0+
- Atrae contribuidores
- Credibilidad técnica

---

## 🎯 Conclusión

Este roadmap es una **guía, no un contrato**. Las prioridades pueden cambiar según:

- Feedback de usuarios
- Cambios en el mercado
- Limitaciones técnicas
- Recursos disponibles

**Flexibilidad es clave**. Lo importante es construir algo que la gente quiera usar.

---

**Última actualización**: Enero 2026
**Próxima revisión**: Post-v0.5.2 (marzo 2026)
**Dueño de producto**: Javier Benítez
