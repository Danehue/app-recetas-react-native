import firebase from "../../database/firebase.js";
import { getStorage, ref, uploadString, deleteObject, getDownloadURL } from 'firebase/storage';

// Obtén una referencia al servicio de almacenamiento de Firebase
const storage = getStorage();

// Función para subir una imagen a Firebase Storage
export const uploadImage = async (localUri, imageName) => {
  try {
    const storageRef = ref(storage, imageName);
    await uploadString(storageRef, localUri, 'data_url');
    console.log('Imagen subida exitosamente');
  } catch (error) {
    console.error('Error al subir la imagen:', error);
  }
};

// Función para borrar una imagen de Firebase Storage
export const deleteImage = async (imageName) => {
  try {
    const storageRef = ref(storage, imageName);
    await deleteObject(storageRef);
    console.log('Imagen eliminada exitosamente');
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
  }
};

// Función para obtener la URL de una imagen almacenada en Firebase Storage
export const getImageURL = async (imageName) => {
  try {
    const storageRef = ref(storage, imageName);
    const downloadURL = await getDownloadURL(storageRef);
    console.log('URL de la imagen:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error al obtener la URL de la imagen:', error);
    return null;
  }
};

export default { storage, uploadImage, deleteImage, getImageURL };
