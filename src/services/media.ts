import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import { makeId } from '@/utils/formatters';

type PickedImage = {
  localUri: string;
  width?: number;
  height?: number;
};

type MediaFolder = 'logos' | 'orders' | 'signatures';
type ImageSource = 'library' | 'camera';

const mediaRoot = `${FileSystem.documentDirectory ?? ''}ordempro-media`;

async function ensureDirectory(path: string) {
  if (Platform.OS === 'web') return;
  await FileSystem.makeDirectoryAsync(path, { intermediates: true });
}

export async function pickAndStoreImage(folder: MediaFolder, source: ImageSource = 'library'): Promise<PickedImage | null> {
  const permission = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(source === 'camera' ? 'Permita acesso a camera para tirar fotos.' : 'Permita acesso as fotos para selecionar uma imagem.');
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.85,
  };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || !result.assets[0]?.uri) return null;

  const asset = result.assets[0];
  const resized = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: folder === 'logos' || folder === 'signatures' ? 720 : 1280 } }],
    { compress: folder === 'orders' ? 0.78 : 0.86, format: ImageManipulator.SaveFormat.JPEG },
  );

  if (Platform.OS === 'web') {
    return { localUri: resized.uri, width: resized.width, height: resized.height };
  }

  const directory = `${mediaRoot}/${folder}`;
  await ensureDirectory(directory);
  const destination = `${directory}/${makeId(folder)}.jpg`;
  await FileSystem.copyAsync({ from: resized.uri, to: destination });

  return { localUri: destination, width: resized.width, height: resized.height };
}

export async function clearStoredMedia() {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) return;
  try {
    await FileSystem.deleteAsync(mediaRoot, { idempotent: true });
  } catch (error) {
    console.warn('Nao foi possivel limpar midias locais do OrdemPro:', error);
  }
}
