# Configuración v0.5.1 - Auth Extendida

## ⚠️ CONFIGURACIÓN REQUERIDA EN FIREBASE CONSOLE

Antes de desplegar v0.5.1, necesitas configurar los proveedores de autenticación en Firebase Console.

---

## 🔐 Paso 1: Configurar Google Auth

1. Ve a: https://console.firebase.google.com
2. Proyecto: diario-de-un-instante
3. **Authentication** > **Sign-in method**
4. Habilita **Google**:
   - Estado: ON
   - Email de soporte del proyecto: tu@email.com
   - Añade dominio autorizado: `diariodeuninstante.com` (y `localhost` para desarrollo)
5. Haz clic en **Guardar**

---

## 🍎 Paso 2: Configurar Apple Auth

1. En la misma página: **Authentication** > **Sign-in method**
2. Habilita **Apple**:
   - Estado: ON
   - **Bundle ID**: Necesario para iOS (opcional para web)
   - **Service ID**: Crea uno si es necesario
   - **API Key**: Configura en tu Apple Developer Account
   - **Team ID**: Tu Team ID de Apple Developer
   - **Key ID**: Tu Key ID
   - **Dominios autorizados**:
     - `diariodeuninstante.com`
     - `localhost:3000` (desarrollo)
3. Haz clic en **Guardar**

### Nota Importante sobre Apple Auth
- **Requiere**: Apple Developer Account ($99/año)
- **Si no tienes cuenta**: Deja Apple Auth deshabilitado, el código está preparado para manejarlo
- **En desarrollo**: Apple Auth solo funciona en HTTPS (no en localhost sin configuración adicional)

---

## 🔑 Paso 3: Configurar Email Link (Magic Link)

1. En **Authentication** > **Sign-in method**
2. Habilita **Email/Password** (ya debería estar habilitado)
3. Habilita **Email link (passwordless sign-in)**:
   - Estado: ON
4. **Dominios autorizados**:
   - `diariodeuninstante.com`
   - `localhost:3000` (desarrollo)
5. Haz clic en **Guardar**

---

## 📧 Paso 4: Configurar Plantillas de Email

### Email de Verificación
1. **Authentication** > **Templates** > **Email address verification**
2. Personaliza el asunto y cuerpo del email
3. **Action URL**: `https://www.diariodeuninstante.com/verify-email`

### Reset Password
1. **Authentication** > **Templates** > **Password reset**
2. Personaliza el asunto y cuerpo del email
3. **Action URL**: `https://www.diariodeuninstante.com/reset-password`

---

## 🌐 Paso 5: Configurar Dominios Autorizados

Ve a: **Authentication** > **Settings** > **Authorized domains**

Añade estos dominios:
- `diariodeuninstante.com` ✓
- `localhost:3000` (desarrollo) ✓

---

## 📋 Checklist de Configuración

- [ ] Google Auth habilitado
- [ ] Apple Auth habilitado (opcional, requiere Apple Developer Account)
- [ ] Email Link (Magic Link) habilitado
- [ ] Email/Password habilitado
- [ ] Dominios autorizados configurados
- [ ] Plantillas de email personalizadas

---

## 🚀 Después de Configurar

Una vez configurado todo en Firebase Console:

1. **Commit y push** de los cambios de v0.5.1
2. **Deploy automático** en Vercel
3. **Testing**:
   - Prueba login con Google
   - Prueba login con Apple (si está configurado)
   - Prueba Magic Link
   - Prueba Reset Password
   - Prueba Email Verification

---

## ⚠️ Errores Comunes

### "OAuth provider not configured"
**Solución**: Habilita el proveedor en Firebase Console > Authentication > Sign-in method

### "Unauthorized domain"
**Solución**: Añade el dominio a Authorized domains en Firebase Console

### "Apple Sign in requires HTTPS"
**Solución**: Apple Auth solo funciona en HTTPS. En desarrollo usa ngrok o similar para probar.

### "Magic link not working"
**Solución**: Verifica que el dominio esté autorizado y que la Action URL sea correcta

---

## 📚 Recursos

- [Firebase Auth Google](https://firebase.google.com/docs/auth/web/google-signin)
- [Firebase Auth Apple](https://firebase.google.com/docs/auth/web/apple)
- [Firebase Auth Email Link](https://firebase.google.com/docs/auth/web/email-link-auth)

---

## ✅ Checklist Pre-Deploy

- [ ] Configuración completada en Firebase Console
- [ ] Dominios autorizados añadidos
- [ ] Plantillas de email configuradas
- [ ] Google Auth probado en local
- [ ] Magic Link probado en local
- [ ] Reset Password probado en local
- [ ] Ready para deploy en producción

---

**Versión**: 0.5.1
**Estado**: Configuración pendiente
**Fecha**: Enero 2026
