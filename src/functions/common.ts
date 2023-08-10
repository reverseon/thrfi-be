import { generateSHA256Hash } from "./crypto";

const bufferToChars = (buffer: Uint8Array): string => {
    // byte to its representation. ie 0xFF -> 'FF'
    let byteToHex = (byte: number): string => {
        return ('0' + byte.toString(16)).slice(-2);
    }
    return Array.prototype.map.call(buffer, byteToHex).join('');
}

const charsToBuffer = (chars: string): Uint8Array => {
    // representation to its byte. ie 'FF' -> 0xFF
    let hexToByte = (hex: string): number => {
        return parseInt(hex, 16);
    }
    let buffer = new Uint8Array(chars.length / 2);
    for (let i = 0; i < chars.length; i += 2) {
        buffer[i / 2] = hexToByte(chars.substr(i, 2));
    }
    return buffer;
}

const rand_id = (length: number) => {
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // randomize chars
    chars = chars.split('').sort(() => Math.random() - 0.5).join('');
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result
}

const check_key_exists = async (kv: KVNamespace, key: string): Promise<boolean> => {
    let val = await kv.get(await generateSHA256Hash(key));
    return val !== null;
}

const random_unique_id = async (kv: KVNamespace, length: number): Promise<string> => {
    let id = rand_id(length);
    let max_tries = 100;
    let tries = 0;
    let val = await kv.get(await generateSHA256Hash(id));
    while (val !== null && tries < max_tries) {
        id = rand_id(length);
        tries++;
    }
    return id;
}

export {
    bufferToChars,
    charsToBuffer,
    rand_id,
    check_key_exists,
    random_unique_id,
}