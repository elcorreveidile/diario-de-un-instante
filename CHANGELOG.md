# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-01-29

### Added 🎉
- **Plantillas por área**: 55 preguntas guía (5 por cada una de las 11 áreas)
  - Combat el "síndrome de la página en blanco"
  - Preguntas contextuales que aparecen al seleccionar un área
  - Botones clickeables para usar pregunta como base del instante
- **Sistema de tags/etiquetas transversales**:
  - Campo `tags` en instantes (array de strings)
  - Input con autocompletado usando tags existentes
  - Máximo 10 tags por instante
  - Página `/tag/[tag]` para ver todos los instantes con un tag específico
  - Tags mostrados como chips en InstanteCard con enlaces
  - API `/api/tags` para obtener tags populares y todos los tags
  - Tags en minúsculas y sin duplicados
- **Sistema de imágenes en instantes**:
  - Upload de 1-5 imágenes por instante
  - Integración con Firebase Storage
  - Validación: solo imágenes, máx 5MB por archivo
  - Galería responsive en página del instante
  - Lazy loading para optimizar carga
  - Preview de imágenes antes de guardar
  - Eliminación de imágenes individuales
  - URLs permanentes sin token (formato `?alt=media`)

### Changed 🔄
- **Formulario de creación**: Rediseñado con nuevos componentes
  - Sección de preguntas guía dinámica
  - Input de tags con dropdown de sugerencias
  - Galería de imágenes con drag & drop
- **Firestore**: Añadidos campos `tags` e `images` a documentos de instantes
- **Firebase Storage**: Nuevas reglas de seguridad para `/instantes/{userId}/{allPaths=**}`
- **Next.js config**: Añadido `firebasestorage.googleapis.com` a `remotePatterns` para imágenes

### Fixed 🐛
- **Permisos de comentarios**: Error `7 PERMISSION_DENIED` al crear comentarios
  - Cambiado de `createComment()` (cliente) a `adminDb.collection().add()` (servidor)
  - El servidor ahora bypass las reglas de seguridad de Firestore
- **React Hook error**: Función `usePrompt` renombrada a `applyPrompt`
  - React confunde funciones que empiezan con "use" como Hooks
- **Display de imágenes**: Error 400 al ver imágenes de Firebase Storage
  - Cambiado de `getDownloadURL()` (token temporal) a URLs permanentes manuales
  - Formato: `https://firebasestorage.googleapis.com/v0/b/bucket/o/{path}?alt=media`

### Technical Details 🛠️
- **Firebase Storage**: Funciones `uploadInstanteImages()`, `deleteInstanteImage()`, `deleteAllInstanteImages()`
- **Firestore**: Funciones `getAllTags()`, `getInstantesByTag()`, `getPopularTags()`
- **ImageMetadata interface**: `url`, `path`, `name`, `size`, `type`, `uploadedAt`
- **URL encoding**: Path segments codificados individualmente para Firebase Storage

### Database Schema 📊
- `instante.tags`: `string[]` (opcional)
- `instante.images`: `ImageMetadata[]` (opcional)
  - `url`: URL permanente de la imagen
  - `path`: Ruta en Firebase Storage
  - `name`: Nombre original del archivo
  - `size`: Tamaño en bytes
  - `type`: MIME type (ej: "image/jpeg")
  - `uploadedAt`: Timestamp de subida

### Breaking Changes ⚠️
None - Todos los campos nuevos son opcionales y compatibles con instantes existentes

### Migration Notes 📝
- Instantes existentes sin campos `tags` o `images` siguen funcionando normalmente
- No se requiere migración de datos
- Los nuevos campos son opcionales en el formulario de creación

### Roadmap 🗺️
La **Fase 4: Programar publicación** se pospone a v0.8:
- Scheduler con Vercel Cron
- Programación de publicación automática
- Email de notificación cuando se publique
- Selector de fecha/hora en formulario

---

## [0.5.2] - 2026-01-28

### Added 🎉
- **User blogs functionality**: Users can now have their own public blogs at `/u/[username]`
  - Each user gets a customizable blog with their instantes públicos
  - Username configuration in `/admin/configuracion-blog`
  - Support for custom primary/secondary colors, header photo, and bio
- **Debug page**: `/debug-users` page to view all users and their username configuration status

### Changed 🔄
- **Blog configuration**: Added username field to blog configuration
- **Firestore queries**: Switched from Firebase Client SDK to Firebase Admin SDK in API routes
  - Fixes "Missing or insufficient permissions" errors in server components
  - API routes: `/api/user/[username]` and `/api/user/[username]/instantes`
- **Instant fetching**: Updated to use API routes instead of direct Firestore access

### Fixed 🐛
- **Blog de usuarios**: User blogs at `/u/[username]` now work correctly
  - Proper dynamic URL construction using Next.js headers
  - Correct filtering of public instantes by user
- **Color contrast in InstanteCard**:
  - Light mode: Changed text from `text-gray-500/600` to `text-gray-700/800` for better readability
  - Dark mode: Added `dark:!bg-gray-800` to override secondaryColor for proper contrast
  - Title weight changed from `font-medium` to `font-semibold`
  - Border visibility improved (`border-gray-200` → `border-gray-300`)
- **Statistics privacy**: Fixed privacy issue where logged-in users could see other users' statistics
  - Changed from `getAllInstantes()` to `getInstantesByUser(user.uid)`
  - Each user now only sees their own statistics in `/admin/estadisticas`
- **Monthly comparison**: Fixed "undefined 2026" error in statistics
  - Added handling for months out of range (< 0 or > 11) in `formatMes()` function
  - Correctly adjusts year when wrapping between years
- **Archive filtering**: Fixed archive not showing instantes
  - Changed `getPublicInstantes()` to filter on client instead of Firestore query
  - Includes instantes without `privado` field (defaults to public)
  - Applied same fix to `getPublicInstantesByArea()`
- **Private instantes visibility**: Users can now see their own private instantes
  - Fixed race condition in `/[area]/[slug]/page.tsx` causing 404 for private instantes
  - Added proper user authentication check before loading instantes
  - Implemented cancellation flag to prevent state updates after unmount
  - Changed useEffect dependency from `user` object to `user.uid` for stability
- **Home page layout**: Moved "Solicitar invitación" section to top of page
  - Button now appears alongside "Panel de admin" button
  - Invitation form shows inline when clicked
  - Improved UX with both CTAs prominent at the top

### Technical Details 🛠️
- **Firebase Admin SDK integration**: Created `lib/firebase-admin.ts` for server-side Firebase access
- **Dynamic URL construction**: Helper function using `next/headers` for proper URL detection
- **Username field**: Added to user documents and blog configuration interface
- **User detection**: Enhanced `getUserByUsername()` to search by username field first, then fallback to displayName

### Database Schema 📊
- Added `username` field to user documents (stored in lowercase)
- Added `headerPhotoURL`, `primaryColor`, `secondaryColor`, `bio` fields for blog customization

### Breaking Changes ⚠️
None

### Migration Notes 📝
- Existing users need to configure their username via `/admin/configuracion-blog` to activate their blog
- Old instantes without `privado` field now default to public (consistent with intended behavior)

---

## [0.5.1] - Previous Release

### Features
- Initial version of Diario de un Instante
- Core instant creation and management
- 11 life areas tracking
- Statistics dashboard
- Invitation system

[0.5.2]: https://github.com/elcorreveidile/diario-de-un-instante/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/elcorreveidile/diario-de-un-instante/releases/tag/v0.5.1
