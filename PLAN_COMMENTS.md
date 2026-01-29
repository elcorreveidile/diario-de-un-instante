# Plan de Implementación: Sistema de Comentarios

## Overview
Sistema de comentarios con respuestas anidadas, moderación y notificaciones por email.

## Fase 1: Backend - Firestore & APIs

### 1.1 Data Structure
**Colección: `comments`**
```typescript
{
  id: string;                    // Auto-generated
  instanteId: string;            // ID del instante
  userId: string;                // UID del autor del comentario
  userName: string;              // Nombre para mostrar
  userPhoto?: string;            // URL foto perfil
  content: string;               // Texto del comentario
  parentId?: string | null;      // null = nivel superior, string = respuesta
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  editedAt?: Timestamp;
  deletedAt?: Timestamp;         // Soft delete
}
```

### 1.2 Archivos a Modificar

**`/lib/firestore.ts`**
- Añadir interfaces: `Comment`, `CommentInput`, `CommentWithReplies`
- Implementar funciones:
  - `createComment(data)` → devuelve commentId
  - `getThreadedComments(instanteId)` → devuelve árbol de comentarios
  - `updateComment(commentId, content)` → actualiza contenido + editedAt
  - `deleteComment(commentId, userId)` → soft delete (deletedAt)
  - `moderateComment(commentId, instanteAuthorId, action)` → aprueba/rechaza

**`/lib/email.ts`**
- Añadir función: `sendCommentNotification(authorEmail, instanteTitle, commentContent, commenterName)`
- Añadir función: `sendCommentReplyNotification(parentCommentAuthor, replyContent)`

### 1.3 Nuevos Endpoints API

**`/app/api/comments/route.ts`** (POST)
```typescript
// Crear comentario nuevo
export async function POST(request: NextRequest) {
  const { userId } = await adminAuth.verifyIdToken(token);
  const data = await request.json();
  const commentId = await createComment(data);

  // Enviar notificación si es comentario nivel superior
  if (!data.parentId) {
    await sendCommentNotification(...);
  } else {
    await sendCommentReplyNotification(...);
  }

  return NextResponse.json({ commentId });
}
```

**`/app/api/comments/[instanteId]/route.ts`** (GET)
```typescript
// Obtener comentarios de un instante
export async function GET(
  request: NextRequest,
  { params }: { params: { instanteId: string } }
) {
  const comments = await getThreadedComments(params.instanteId);
  return NextResponse.json(comments);
}
```

**`/app/api/comments/[commentId]/route.ts`** (PATCH)
```typescript
// Editar comentario
export async function PATCH(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const { userId } = await adminAuth.verifyIdToken(token);
  await updateComment(params.commentId, content);
  return NextResponse.json({ success: true });
}
```

**`/app/api/comments/[commentId]/route.ts`** (DELETE)
```typescript
// Eliminar comentario (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const { userId } = await adminAuth.verifyIdToken(token);
  await deleteComment(params.commentId, userId);
  return NextResponse.json({ success: true });
}
```

**`/app/api/admin/comments/[commentId]/moderate/route.ts`** (POST)
```typescript
// Moderación de comentarios (aprobar/rechazar/marcar spam)
export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const { userId } = await adminAuth.verifyIdToken(token);
  const { action, instanteId } = await request.json();

  // Verificar que userId es el autor del instante
  const instante = await getInstanteById(instanteId);
  if (instante.userId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await moderateComment(params.commentId, userId, action);
  return NextResponse.json({ success: true });
}
```

## Fase 2: Frontend - Componentes

### 2.1 Componentes a Crear

**`/components/comments/CommentForm.tsx`**
```typescript
interface CommentFormProps {
  instanteId: string;
  parentId?: string;      // Si existe, es una respuesta
  onSuccess?: () => void;
  placeholder?: string;
}

// Formulario con textarea + botón submit
// Usa el hook useAuth() para obtener userId
// POST /api/comments
```

**`/components/comments/CommentItem.tsx`**
```typescript
interface CommentItemProps {
  comment: CommentWithReplies;
  instantOwnerId: string;  // Para mostrar badges de moderador
  onReply?: (parentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onModerate?: (commentId: string, action: string) => void;
}

// Muestra:
// - Avatar + nombre + fecha
// - Contenido del comentario
// - Badge si es moderador (autor del instante)
// - Acciones: Responder, Editar (si es autor), Eliminar (si es autor)
// - Moderación: Aprobar/Rechazar/Spam (si eres autor del instante)
// - Respuestas anidadas recursivamente
```

**`/components/comments/CommentList.tsx`**
```typescript
interface CommentListProps {
  instanteId: string;
  instantOwnerId: string;
}

// Hace fetch a GET /api/comments/[instanteId]
// Renderiza CommentForm para nuevo comentario
// Renderiza lista de CommentItem
// Gestiona estado de carga/error
```

### 2.2 Integración en Página

**`/app/i/[id]/page.tsx`**
- Añadir `CommentList` después del contenido del instante
- Pasar `instanteId` y `instantOwnerId` como props

## Fase 3: Panel de Moderación

**`/app/admin/(dashboard)/comments/page.tsx`**
- Lista todos los comentarios pendientes (`status: pending`)
- Para cada comentario:
  - Muestra contenido, autor, fecha
  - Acciones: Aprobar, Rechazar, Marcar Spam
  - Link al instante original
- Filtrado por estado (pending/approved/rejected/spam)

## Seguridad & Permisos

1. **Crear comentario**: Usuario autenticado
2. **Editar comentario**: Solo el autor
3. **Eliminar comentario**: Solo el autor (soft delete)
4. **Moderar**: Solo el autor del instante donde está el comentario
5. **Ver comentarios**: Todos (público)

## Firestore Security Rules

```javascript
match(/comments/{commentId}) {
  allow read: if true;
  allow create: if request.auth != null;
  allow update: if request.auth != null && resource.data.userId == request.auth.uid;
  allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
}
```

## Orden de Implementación

1. ✅ Backend (lib/firestore.ts, APIs)
2. ✅ Componentes básicos (CommentForm, CommentItem, CommentList)
3. ✅ Integración en página de instante
4. ✅ Panel de moderación
5. ✅ Testing y correcciones
