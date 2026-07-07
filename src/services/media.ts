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
    [{ resize: { width: folder === 'logos' || folder === 'signatures' ? 600 : 1024 } }],
    { compress: folder === 'orders' ? 0.72 : 0.82, format: ImageManipulator.SaveFormat.JPEG },
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

export async function deleteLocalFile(uri?: string | null) {
  if (!uri || Platform.OS === 'web' || uri.startsWith('data:image')) return false;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return false;
    await FileSystem.deleteAsync(uri, { idempotent: true });
    return true;
  } catch (error) {
    console.warn('Nao foi possivel remover arquivo local do OrdemPro:', error);
    return false;
  }
}

async function collectFiles(path: string): Promise<string[]> {
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists || !info.isDirectory) return [];
    const names = await FileSystem.readDirectoryAsync(path);
    const nested = await Promise.all(names.map(async (name) => {
      const child = `${path}/${name}`;
      const childInfo = await FileSystem.getInfoAsync(child);
      if (childInfo.exists && childInfo.isDirectory) return collectFiles(child);
      return childInfo.exists ? [child] : [];
    }));
    return nested.flat();
  } catch {
    return [];
  }
}

export async function cleanupOrphanMedia(usedUris: string[]) {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) return { scanned: 0, removed: 0 };
  const used = new Set(usedUris.filter((uri) => uri && uri.startsWith(mediaRoot)));
  const files = await collectFiles(mediaRoot);
  let removed = 0;
  for (const file of files) {
    if (used.has(file)) continue;
    if (await deleteLocalFile(file)) removed += 1;
  }
  return { scanned: files.length, removed };
}

export async function imageUriToDataUri(uri?: string | null) {
  if (!uri || uri.startsWith('data:image')) return uri ?? undefined;
  if (Platform.OS === 'web') return uri;
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const lowerUri = uri.toLowerCase();
    const mime = lowerUri.endsWith('.png') ? 'image/png' : lowerUri.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  } catch (error) {
    console.warn('Nao foi possivel preparar imagem para PDF:', error);
    return uri;
  }
}
