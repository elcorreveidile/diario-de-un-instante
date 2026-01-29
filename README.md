# Diario de un Instante

Un jardín digital para cultivar un año 2026 más consciente y con propósito, un instante a la vez.

Diario de un Instante es un sistema de gestión de vida personal diseñado para capturar "instantes" —pensamientos, ideas y acciones— a lo largo de 11 áreas fundamentales de la vida. Al registrar estos pequeños momentos, puedes ver cómo se suman para dar forma a tus días, semanas y, finalmente, a todo tu año.

## 🌟 Concepto

La idea es simple pero poderosa: transformar la planificación abstracta en una experiencia vivida, fomentando la auto-reflexión y el crecimiento continuo a través de la observación atenta de los pequeños instantes de la vida cotidiana.

## 🏗️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Firebase Firestore
- **Storage**: Firebase Storage (imágenes)
- **Autenticación**: Firebase Auth (Email/Password, Google, Apple)
- **Alojamiento**: Vercel
- **Admin SDK**: Firebase Admin (server-side operations)

## 📂 Las 11 Áreas

El sistema se estructura en torno a estas áreas fundamentales:

1. 💼 **Trabajo** - Proyectos, logros y aprendizaje profesional
2. 📚 **Aprendizaje** - Libros, cursos y desarrollo de skills
3. 💪 **Salud** - Ejercicio, alimentación y bienestar
4. 🎭 **Gestión Cultural** - Cine, teatro, música y arte
5. 🎮 **Ocio** - Entretenimiento y tiempo libre
6. ✨ **Creación** - Proyectos creativos y expresión personal
7. 👥 **Amistades** - Relaciones sociales y comunidad
8. 👨‍👩‍👧‍👦 **Familia** - Tiempo en familia y eventos
9. 🌍 **Entorno** - Hogar, espacios y entorno físico
10. 💰 **Finanzas** - Ahorros, inversiones y finanzas personales
11. 🧠 **Espíritu** - Meditación, mindfulness y crecimiento interior

## 🎯 Características por Versión

### v0.7 - Contenido Avanzado ✅

**Sistema de Etiquetas Transversales**
- Tags organizativos independientes de las áreas
- Autocompletado con tags existentes
- Máximo 10 tags por instante
- Páginas de tag: `/tag/[tag]` para explorar contenido
- API de tags populares

**Plantillas por Área**
- 55 preguntas guía (5 por área)
- Preguntas contextuales que combaten el "síndrome de la página en blanco"
- Botones clickeables para usar plantillas como base
- Prompts inteligentes según el área seleccionada

**Sistema de Imágenes**
- Adjuntar 1-5 imágenes por instante
- Firebase Storage con URLs permanentes
- Galería responsive con lazy loading
- Drag & drop para subir imágenes
- Validación automática (máx 5MB por imagen)

### v0.5.2 - Blogs Personalizables ✅

**Blogs de Usuario**
- Cada usuario tiene su blog público en `/u/[username]`
- Personalización: colores, foto de cabecera, bio
- Configuración desde el panel de admin

**Panel de Estadísticas**
- Visualización de instantes por área
- Comparativas mensuales
- Gráficos de evolución personal

**Correcciones de Bugs**
- Privacidad en estadísticas (cada usuario ve solo sus datos)
- Filtrado correcto de instantes privados
- Contraste mejorado en modo claro/oscuro
- Archivo mostrando todos los instantes correctamente

### v0.5.1 - Versión Inicial ✅

**Sistema de Invitaciones**
- Registro solo con código de invitación
- Gestión de invitaciones desde admin
- Control de acceso seguro

**Gestión de Instantes**
- Creación de instantes en 11 áreas
- Estados: borrador / publicado
- Instantes privados vs públicos
- Organización por áreas y fechas

**Autenticación**
- Email/Password
- Google OAuth
- Apple Sign In
- Verificación de email

## 🔒 Seguridad

- **Autenticación multifactor**: Email/Password, Google OAuth, Apple Sign In
- **Sistema de invitaciones**: Validación de códigos antes del registro
- **Control de acceso**: Bloqueo de usuarios sin invitación válida
- **Validación en password reset**: Solo usuarios verificados pueden resetear
- **Firebase Security Rules**: Reglas granulares para Firestore y Storage
- **Protección anti-bypass**: Validación de invitación en OAuth y password reset

## 🚀 Roadmap

### v0.8 - Programación de Publicación (Próxima)
- Scheduler con Vercel Cron Jobs
- Programar publicaciones para fecha futura
- Email de notificación al publicarse
- Selector de fecha/hora en formulario

### v0.9 - Social Features (Propuesto)
- Comentarios públicos en instantes
- Sistema de likes/reacciones
- Compartir instantes en redes sociales

### v1.0 - Mobile First (Propuesto)
- Progressive Web App (PWA)
- Offline mode
- Notificaciones push
- Modo oscuro completo optimizado

## 📊 Estructura de Datos

### Instante
```typescript
interface Instante {
  id: string;
  area: string;              // Una de las 11 áreas
  titulo: string;
  contenido: string;
  estado: 'borrador' | 'publicado';
  privado: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];           // v0.7: Etiquetas transversales
  images?: ImageMetadata[];  // v0.7: Imágenes adjuntas
}
```

### Usuario
```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  username?: string;         // v0.5.2: Para blog personal
  role: 'admin' | 'user';
  inviteId?: string;         // Código de invitación usado
  blogConfig?: {
    primaryColor: string;
    secondaryColor: string;
    headerPhotoURL: string;
    bio: string;
  };
}
```

## 🛠️ Desarrollo

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/elcorreveidile/diario-de-un-instante.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Firebase

# Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno Requeridas
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Para producción también necesitarás configurar Firebase Admin SDK:
```
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_PROJECT_ID=
```

## 📄 Changelog

Para ver el historial detallado de cambios por versión, consulta [CHANGELOG.md](CHANGELOG.md).

## 🔗 Enlaces Útiles

- **Producción**: https://www.diariodeuninstante.com
- **GitHub**: https://github.com/elcorreveidile/diario-de-un-instante
- **Issues**: https://github.com/elcorreveidile/diario-de-un-instante/issues

## 📄 Licencia

Este proyecto es de uso personal. © 2026 Diario de un Instante.

## 🤝 Contribuciones

Este es un proyecto personal de código abierto. Si encuentras bugs o tienes sugerencias, abre un issue en GitHub.
