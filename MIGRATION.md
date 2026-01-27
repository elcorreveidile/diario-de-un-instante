# Guía de Migración - v0.5 Multi-tenant

## Resumen de cambios

La v0.5 introduce:
- ✅ **Multi-tenant** - Cada usuario tiene sus propios instantes aislados
- ✅ **Sistema de invitaciones** - Solo usuarios con código pueden registrarse
- ✅ **Roles de usuario** - Admin (puede generar invitaciones) y User
- ✅ **Tú eres el super admin** - Todos tus instantes existentes se asignan a tu cuenta

---

## Pasos para migrar

### 1. Registrar tu cuenta (como Super Admin)

```bash
npm run dev
```

1. Ve a http://localhost:3000/registro
2. Crea tu cuenta con tu email y contraseña
3. **IMPORTANTE**: Anota el código de invitación que usaste (será el primero)

### 2. Obtener tu userId

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Encuentra la clave que empieza con "firebase:authUser"
Object.keys(localStorage)
  .filter(key => key.includes('firebase'))
  .forEach(key => {
    const data = JSON.parse(localStorage.getItem(key));
    console.log('UserId:', data.uid);
    console.log('Email:', data.email);
  });
```

Copia tu `uid`.

### 3. Migrar tus instantes existentes

```bash
# Crea archivo con tu userId
echo "TU_USER_ID_AQUI" > .user-id

# Ejecuta migración
npm run migrate
```

Esto hará:
- ✅ Asignar todos tus instantes existentes a tu userId
- ✅ Asignarte el rol de **Admin**
- ✅ Ya tendrás acceso completo

### 4. Hacer backup (seguridad)

```bash
npm run backup
```

Guarda el archivo `backups/backup-YYYY-MM-DD.json`.

---

## Uso del sistema de invitaciones

### Generar invitaciones

1. Entra a `/admin` (estando autenticado)
2. Verás el enlace **"Invitaciones"** en el menú (solo visible para admins)
3. Haz clic en **"Generar código"**
4. Opcionalmente, restringe el código a un email específico
5. Copia el código y compártelo

### Compartir código

El formato es: `XXXX-XXXX-XXXX`

Ejemplo: `AB3D-K7M2-PQ9R`

Envía este código a las personas que quieres que se registren.

### Ver estadísticas de uso

En la página de Invitaciones puedes ver:
- Todos los códigos generados
- Cuáles están usados y cuáles no
- Quién usó cada código
- Cuándo se usó

---

## Flujo de registro nuevo

1. El usuario potencial va a `/registro`
2. Ingresa sus datos (email, contraseña, nombre opcional)
3. **Ingresa el código de invitación que le diste**
4. Si el código es válido, se crea la cuenta
5. El código se marca como "usado" y no puede reutilizarse

---

## Roles y permisos

### 👑 Admin (tú y los que tú designes)
- Ver todos sus instantes
- Crear, editar, eliminar instantes
- Ver estadísticas
- **Generar códigos de invitación**
- Ver configuración completa

### 👤 User (usuarios invitados)
- Ver solo sus instantes
- Crear, editar, eliminar sus instantes
- Ver sus estadísticas personales
- Ver su configuración básica
- NO pueden generar invitaciones

---

## Consideraciones futuras

Si decides cobrar por el servicio en el futuro, puedes:

1. **Límite de usuarios por código**
   - Actual: 1 código = 1 usuario
   - Futuro: Añadir campo `maxUses` a los códigos

2. **Códigos con fecha de expiración**
   - Añadir `expiresAt` a la colección `invites`
   - Verificar fecha durante el registro

3. **Planes de pago**
   - Añadir colección `subscriptions`
   - Relacionar con `users`
   - Limitar funcionalidades según plan

4. **Subdominios por usuario**
   - `usuario1.diariodeuninstante.com`
   - `usuario2.diariodeuninstante.com`
   - Actual: todos comparten el mismo dominio

---

## Troubleshooting

### Error: "Código de invitación inválido o ya usado"

- Verifica que el código esté bien escrito (en mayúsculas)
- Verifica que el código no haya sido usado antes
- Si usaste el código, contacta al admin para generar uno nuevo

### Error: "No tienes permisos para gestionar invitaciones"

- Tu usuario no tiene rol de `admin`
- Verifica en Firebase Console > Firestore > users > tu documento
- El campo `role` debe ser `"admin"`

### No veo mis instantes antiguos

- Asegúrate de haber ejecutado `npm run migrate`
- Verifica que el `.user-id` tenga tu userId correcto
- Revisa Firebase Console para ver los instantes

---

## Resumen

✅ **Tú eres el super admin**
✅ **Tus instantes están a salvo**
✅ **Solo tú puedes decidir quién se registra**
✅ **Código de invitación obligatorio**
✅ **Listo para escalar si decides cobrar**

¡Disfruta tu Diario de un Instante multi-tenant! 🎉
