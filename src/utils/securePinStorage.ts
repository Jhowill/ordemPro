import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { SecuritySettings } from '@/types';
import { createPinSalt, hashPin, isValidPin } from '@/utils/pinSecurity';
import { nowIso } from '@/utils/formatters';

const SECURE_PIN_KEY = 'ordempro.pin.v1';

type StoredPin = {
  pinSalt: string;
  pinHash: string;
  updatedAt: string;
};

function canUseSecureStore() {
  return Platform.OS !== 'web';
}

function parseStoredPin(value: string | null): StoredPin | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StoredPin>;
    if (!parsed.pinSalt || !parsed.pinHash || !parsed.updatedAt) return null;
    return {
      pinSalt: parsed.pinSalt,
      pinHash: parsed.pinHash,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export async function createSecurePinSettings(pin: string): Promise<SecuritySettings> {
  if (!isValidPin(pin)) throw new Error('PIN invalido.');
  const pinSalt = createPinSalt();
  const pinHash = hashPin(pin, pinSalt);
  const updatedAt = nowIso();

  if (!canUseSecureStore()) {
    return { isPinEnabled: true, pinStorage: 'database', pinSalt, pinHash, updatedAt };
  }

  await SecureStore.setItemAsync(SECURE_PIN_KEY, JSON.stringify({ pinSalt, pinHash, updatedAt }));
  return { isPinEnabled: true, pinStorage: 'secure_store', updatedAt };
}

export async function verifySecurityPin(pin: string, security: SecuritySettings) {
  if (!security.isPinEnabled || !isValidPin(pin)) return false;

  if (security.pinStorage === 'secure_store' && canUseSecureStore()) {
    const storedPin = parseStoredPin(await SecureStore.getItemAsync(SECURE_PIN_KEY));
    if (storedPin) return hashPin(pin, storedPin.pinSalt) === storedPin.pinHash;
  }

  if (!security.pinSalt || !security.pinHash) return false;
  return hashPin(pin, security.pinSalt) === security.pinHash;
}

export async function deleteSecurePin() {
  if (!canUseSecureStore()) return;
  await SecureStore.deleteItemAsync(SECURE_PIN_KEY);
}
