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

const mediaRoot = `${FileSystem.documentDirectory ?? ''}ordempro-media`;

async function ensureDirectory(path: string) {
  if (Platform.OS === 'web') return;
  await FileSystem.makeDirectoryAsync(path, { intermediates: true });
}

export async function pickAndStoreImage(folder: 'logos' | 'orders'): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permita acesso as fotos para selecionar uma imagem.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) return null;

  const asset = result.assets[0];
  const resized = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: folder === 'logos' ? 720 : 1280 } }],
    { compress: 0.78, format: ImageManipulator.SaveFormat.JPEG },
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
