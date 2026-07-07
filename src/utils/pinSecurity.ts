import { makeId } from '@/utils/formatters';

export function normalizePinInput(value: string) {
  return value.replace(/\D/g, '').slice(0, 6);
}

export function isValidPin(pin: string) {
  return /^\d{4,6}$/.test(pin);
}

export function createPinSalt() {
  return `${makeId('pin')}:${Date.now()}`;
}

export function hashPin(pin: string, salt: string) {
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  const input = `${salt}:${pin}`;

  for (let round = 0; round < 12000; round += 1) {
    for (let index = 0; index < input.length; index += 1) {
      const code = input.charCodeAt(index) + round;
      first ^= code;
      first = Math.imul(first, 0x01000193);
      second ^= first + code;
      second = Math.imul(second, 0x85ebca6b);
    }
  }

  return `${(first >>> 0).toString(16).padStart(8, '0')}${(second >>> 0).toString(16).padStart(8, '0')}`;
}

export function verifyPin(pin: string, salt?: string, hash?: string) {
  if (!salt || !hash || !isValidPin(pin)) return false;
  return hashPin(pin, salt) === hash;
}
