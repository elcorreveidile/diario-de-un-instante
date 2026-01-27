# Guía de Producción - v0.5 Multi-tenant

## 🚀 Tu sitio YA está en producción

**URL**: https://www.diariodeuninstante.com

Esta guía es específica para desplegar los cambios de v0.5 en producción.

---

## ⚠️ ANTES DE EMPEZAR - BACKUP OBLIGATORIO

```bash
# Hacer backup de TODOS los datos
npm run backup
```

**Verifica que el archivo `backups/backup-YYYY-MM-DD.json` existe y tiene todos tus instantes.**

---

## 📋 CASO 1: Ya tienes cuenta en Firebase (TU CASO)

### PASO 1: Obtener tu userId

**Opción A - Firebase Console (MÁS FÁCIL):**
1. Ve a: https://console.firebase.google.com
2. Proyecto: diario-de-un-instante
3. **Authentication** > **Users**
4. Busca tu email
5. Haz clic en tu email
6. **Copia el User UID** (algo como `abc123xyz...`)

**Opción B - Desde la web:**
1. Entra a https://www.diariodeuninstante.com
2. Presiona **F12** > Console
3. Ejecuta:
   ```javascript
   Object.keys(localStorage)
     .filter(key => key.includes('firebase:authUser'))
     .forEach(key => {
       const data = JSON.parse(localStorage.getItem(key));
       console.log(data.uid);
     });
   ```
4. Copia el uid

### PASO 2: Asignarte rol de Admin

Ve a Firebase Console > Firestore Database:

1. **Inicia colección**: `users`
2. **ID del documento**: TU_USER_ID (pega tu uid aquí)
3. Campos:
   ```json
   {
     "email": "tu@email.com",
     "displayName": "Tu Nombre (opcional)",
     "role": "admin",
     "createdAt": {"__sv":"Timestamp"}
   }
   ```

### PASO 3: Migrar tus instantes

```bash
# Crear archivo con tu userId
echo "TU_USER_ID_AQUI" > .user-id

# Ejecutar migración
npm run migrate
```

### PASO 4: Verificar

Entra a: https://www.diariodeuninstante.com/admin
- ✅ Debes ver todos tus instantes
- ✅ Enlace "Invitaciones" en el menú
- ✅ Rol de Administrador en Configuración

¡LISTO! Salta al **PASO 6** para generar códigos para otros usuarios.

---

## 📋 CASO 2: NO tienes cuenta (Necesitas registrarte)

---

## 📋 PASO 4: Migrar tus instantes a tu cuenta

### Opción A: Desde tu máquina local

```bash
# Crear archivo con tu userId
echo "TU_USER_ID_COPIADO_AQUI" > .user-id

# Ejecutar migración
npm run migrate
```

### Opción B: Directamente en Firebase Console

Si no puedes ejecutar el script localmente:

1. Ve a **Firestore Database**
2. Colección `instantes`
3. Para cada documento (tus instantes existentes):
   - Haz clic en el documento
   - Añade campo: `userId` (string) = TU_USER_ID

4. Ve a colección `users`
5. Crea documento con ID = TU_USER_ID
   ```json
   {
     "email": "tu@email.com",
     "displayName": "",
     "role": "admin",
     "createdAt": {"__sv":"Timestamp"}
   }
   ```

---

## 📋 PASO 5: Verificar que todo funciona

1. Entra a: https://www.diariodeuninstante.com/admin
2. Deberías ver:
   - ✅ Tus instantes existentes
   - ✅ Opción de "Invitaciones" en el menú
   - ✅ Tu rol de "Administrador" en Configuración

3. Crea un instante de prueba
4. Marcalo como **público**
5. Ve a la home: https://www.diariodeuninstante.com
6. Deberías ver tu nuevo instante

---

## 📋 PASO 6: Generar códigos para otros usuarios

1. Entra a: https://www.diariodeuninstante.com/admin/invitaciones
2. Haz clic en "Generar código"
3. Copia el código (ej: `AB3D-K7M2-PQ9R`)
4. Envíalo a quien quieras

---

## 🔒 CÓMO FUNCIONA AHORA

### Páginas públicas (cualquiera puede ver)
- **Home**: Muestra instantes públicos de **TODOS los usuarios**
- **Archivo**: Muestra instantes públicos de **TODOS los usuarios**
- **Áreas**: Muestra instantes públicos de **TODOS los usuarios** por área
- **Instante individual**: Muestra instante si es público

### Panel admin (solo usuarios autenticados)
- Cada usuario **SOLO ve sus propios instantes**
- Cada usuario crea, edita, elimina **solo sus instantes**
- **Solo admins** pueden generar códigos de invitación

### Privacidad
- ✅ **Público** = Aparece en home, archivo, áreas
- ❌ **Privado** = Solo lo ve el dueño en su admin

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### "No veo el enlace de Invitaciones"
- Tu usuario no tiene rol de admin
- Ve a Firebase Console > Firestore > users > TU_USER_ID
- Asegúrate que el campo `role` = `"admin"`

### "No veo mis instantes antiguos"
- La migración no se ejecutó correctamente
- Verifica que tus instantes tienen el campo `userId` con tu uid
- Verifica en Firebase Console

### "No puedo registrarme"
- El código de invitación no existe o ya fue usado
- Debes generar un código nuevo en `/admin/invitaciones`

---

## ✅ CHECKLIST DE PRODUCCIÓN

- [ ] Backup creado
- [ ] Código de invitación creado en Firebase Console
- [ ] Cuenta registrada con el código
- [ ] userId obtenido desde la consola
- [ ] Instantes migrados (tienen userId)
- [ ] Rol de admin asignado
- [ ] Invitaciones funcionan
- [ ] Página home muestra contenido de todos
- [ ] Panel admin solo muestra tus instantes
- [ ] Crear instantes funciona
- [ ] Marcar como público/privado funciona

---

## 📊 ARQUITECTURA FINAL

```
┌─────────────────────────────────────────┐
│  PÁGINAS PÚBLICAS (todos los usuarios)  │
├─────────────────────────────────────────┤
│  Home (/)                                │
│  Archivo (/archivo)                      │
│  Áreas (/trabajo, /salud, etc.)          │
│  Instante individual (/area/slug)        │
│  Buscar (/buscar)                        │
└─────────────────────────────────────────┘
           ↓ Muestra instantes públicos de TODOS

┌─────────────────────────────────────────┐
│  PANEL ADMIN (tu usuario solo)           │
├─────────────────────────────────────────┤
│  /admin                                  │
│  /admin/nuevo                            │
│  /admin/editar/[id]                      │
│  /admin/estadisticas                     │
│  /admin/configuracion                    │
│  /admin/invitaciones (solo admins)       │
└─────────────────────────────────────────┘
           ↓ Muestra SOLO tus instantes

┌─────────────────────────────────────────┐
│  AUTH (/login, /registro)                │
├─────────────────────────────────────────┤
│  Requiere código de invitación           │
│  Verifica código en Firestore            │
│  Marca código como usado                 │
└─────────────────────────────────────────┘
```

---

## 🎯 RESUMEN

✅ **Tú eres el super admin**
✅ **Tus instantes públicos se muestran en la home**
✅ **Cada usuario decide qué es público/privado**
✅ **Tú controlas quién se registra con códigos**
✅ **Cada usuario solo ve y edita SUS instantes**
✅ **Listo para escalar si decides cobrar**

---

## 🚀 PRÓXIMOS PASOS (FUTURO)

Si decides cobrar en el futuro:

1. Añadir plans (free, premium)
2. Límite de instantes por plan
3. Subdominios por usuario
4. Códigos de invitación con expiración
5. Pagos integrados (Stripe, etc.)

¡Disfruta tu Diario de un Instante multi-tenant en producción! 🎉
