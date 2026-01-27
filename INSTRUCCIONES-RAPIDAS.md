# Instrucciones Rápidas - v0.5 para Usuario Existente

## Ya tienes cuenta en Firebase - ¡Perfecto!

No necesitas registrarte de nuevo. Solo necesitas:

---

## 🎯 PASO 1: Obtener tu userId actual

### Opción A: Desde Firebase Console (Más fácil)
1. Ve a: https://console.firebase.google.com
2. Proyecto: diario-de-un-instante
3. **Authentication** > **Users**
4. Busca tu email
5. Haz clic en tu email
6. **Copia el User UID** (es algo como `abc123xyz...`)

### Opción B: Desde la web
1. Entra a https://www.diariodeuninstante.com
2. Presiona **F12** (Developer Tools)
3. Pestaña **Console**
4. Ejecuta:
   ```javascript
   Object.keys(localStorage)
     .filter(key => key.includes('firebase:authUser'))
     .forEach(key => {
       const data = JSON.parse(localStorage.getItem(key));
       console.log('=== TU USER ID ===');
       console.log(data.uid);
       console.log('==================');
     });
   ```
5. Copia el uid que aparece

---

## 🎯 PASO 2: Asignarte rol de Admin

### Ve a Firebase Console > Firestore Database

1. **Inicia colección**: `users`
2. **ID del documento**: Pega tu userId
3. Campos:
   ```json
   {
     "email": "tu@email.com",
     "displayName": "Tu Nombre o déjalo vacío",
     "role": "admin",
     "createdAt": {"__sv":"Timestamp","__dt":{"_seconds":1704067200,"_nanoseconds":0}}
   }
   ```

**IMPORTANTE**: El ID del documento debe ser EXACTAMENTE tu userId, no un auto-id.

---

## 🎯 PASO 3: Migrar tus instantes a tu cuenta

### Opción A: Ejecutar el script (Recomendado)

```bash
# Crear archivo con tu userId
echo "TU_USER_ID_AQUI" > .user-id

# Ejecutar migración
npm run migrate
```

Esto hará:
- ✅ Asignar todos tus instantes a tu userId
- ✅ Asignarte rol de admin
- ✅ Todo listo

### Opción B: Manual en Firebase Console

Si el script no funciona, hazlo manual:

1. Ve a **Firestore Database** > Colección `instantes`
2. Para cada documento (tus instantes):
   - Haz clic en el documento
   - **Añadir campo**: `userId` (string)
   - **Valor**: TU_USER_ID
   - Haz clic en **Guardar**

---

## 🎯 PASO 4: Verificar

1. Entra a: https://www.diariodeuninstante.com/admin
2. Deberías ver:
   - ✅ Todos tus instantes
   - ✅ Enlace "Invitaciones" en el menú
   - ✅ Rol de Administrador en Configuración

3. Prueba crear un instante
4. Marcalo como **público**
5. Ve a la home: https://www.diariodeuninstante.com
6. Deberías ver tu instante

---

## ✅ LISTO

Ahora:
- ✅ Eres el Super Admin
- ✅ Tus instantes están aislados bajo tu cuenta
- ✅ Puedes generar códigos de invitación en `/admin/invitaciones`
- ✅ Los instantes que marques como **públicos** aparecerán en la home
- ✅ Los que marques como **privados** solo los ves tú

---

## 🚨 ¿Problemas?

**Si no ves tus instantes en /admin:**
- Verifica que todos tus instantes tengan el campo `userId` con tu uid
- Revisa en Firebase Console > Firestore > instantes

**Si no ves el enlace de Invitaciones:**
- Verifica que en `users` > tu documento
- El campo `role` debe ser `"admin"` (no `"user"`)

**Si algo falla:**
- Tienes el backup en `backups/backup-YYYY-MM-DD.json`
- Puedes restaurar desde Firebase Console
- O contáctame para ayuda

---

## 📝 Nota sobre el primer código de invitación

Una vez que tengas tu rol de admin:

1. Ve a https://www.diariodeuninstante.com/admin/invitaciones
2. Haz clic en "Generar código"
3. Cópiar el código
4. Úsalo para invitar a otros usuarios

¡No necesitas crear códigos manualmente en Firebase Console! El sistema lo hace todo automáticamente.
