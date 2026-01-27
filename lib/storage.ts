import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Sube una imagen a Firebase Storage
 * @param file Archivo a subir
 * @param path Ruta donde se guardará (ej: 'avatars/user123.jpg')
 * @returns URL de descarga de la imagen
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  // Crear referencia en Storage
  const storageRef = ref(storage, path);

  // Subir el archivo
  await uploadBytes(storageRef, file);

  // Obtener URL de descarga
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

/**
 * Sube foto de perfil de usuario
 * @param userId ID del usuario
 * @param file Archivo de imagen
 * @returns URL de la imagen subida
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Validar tamaño (máximo 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('La imagen no puede superar los 2MB');
  }

  // Generar nombre único con timestamp
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const filename = `${userId}_${timestamp}.${extension}`;

  return uploadImage(file, `avatars/${filename}`);
}

/**
 * Sube foto de cabecera de blog
 * @param userId ID del usuario
 * @param file Archivo de imagen
 * @returns URL de la imagen subida
 */
export async function uploadHeaderPhoto(userId: string, file: File): Promise<string> {
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Validar tamaño (máximo 5MB para cabecera)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no puede superar los 5MB');
  }

  // Generar nombre único con timestamp
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const filename = `${userId}_header_${timestamp}.${extension}`;

  return uploadImage(file, `headers/${filename}`);
}
