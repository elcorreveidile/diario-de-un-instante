import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { ImageMetadata } from './firestore';

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

/**
 * Sube imágenes de un instante (1-5 imágenes)
 * @param userId ID del usuario
 * @param instanteId ID del instante
 * @param files Archivos a subir (máximo 5)
 * @returns Array de metadata de imágenes
 */
export async function uploadInstanteImages(
  userId: string,
  instanteId: string,
  files: File[]
): Promise<ImageMetadata[]> {
  if (files.length > 5) {
    throw new Error('Máximo 5 imágenes por instante');
  }

  const results: ImageMetadata[] = [];

  for (const file of files) {
    // Validaciones
    if (!file.type.startsWith('image/')) {
      throw new Error(`El archivo ${file.name} debe ser una imagen`);
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`La imagen ${file.name} supera los 5MB`);
    }

    // Generar nombre único
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${userId}_${instanteId}_${timestamp}.${extension}`;
    const path = `instantes/${userId}/${filename}`;

    try {
      const url = await uploadImage(file, path);

      results.push({
        url,
        path,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error subiendo ${file.name}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Elimina una imagen de Firebase Storage
 * @param path Ruta en Storage
 */
export async function deleteInstanteImage(path: string): Promise<void> {
  const imageRef = ref(storage, path);
  await deleteObject(imageRef);
}

/**
 * Elimina todas las imágenes de un instante
 * @param images Array de metadata de imágenes
 */
export async function deleteAllInstanteImages(images: ImageMetadata[]): Promise<void> {
  await Promise.all(
    images.map(img => deleteInstanteImage(img.path))
  );
}
