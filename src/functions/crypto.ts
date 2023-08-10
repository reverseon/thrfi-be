import { bufferToChars, charsToBuffer } from "./common";

const getPasswordKey = async (password: string): Promise<CryptoKey> => {
    // WebCrypto
    return crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveKey'],
    );
}

const deriveKey = async (passwordKey: CryptoKey, salt: Uint8Array, keyUsage: string[]): Promise<CryptoKey> => {
    // WebCrypto
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        passwordKey,
        {
            name: 'AES-GCM',
            length: 256,
        },
        false,
        keyUsage,
    );
}

const encryptAES = async (
    data: string, key: string,
    salt_length: number,
    iv_length: number,
): Promise<string> => {
    // WebCrypto
    const salt = crypto.getRandomValues(new Uint8Array(salt_length));
    const iv = crypto.getRandomValues(new Uint8Array(iv_length));
    const passwordKey = await getPasswordKey(key);
    const aesKey = await deriveKey(passwordKey, salt, ['encrypt', 'decrypt']);
    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        aesKey,
        new TextEncoder().encode(data),
    );
    const encryptedArray = new Uint8Array(encrypted);
    let buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedArray.byteLength);
    buffer.set(salt, 0);
    buffer.set(iv, salt.byteLength);
    buffer.set(encryptedArray, salt.byteLength + iv.byteLength);
    return bufferToChars(buffer);
}

const decryptAES = async (
    data: string, 
    key: string,
    salt_length: number,
    iv_length: number,
): Promise<string> => {
    // WebCrypto
    const buffer = charsToBuffer(data);
    const salt = buffer.slice(0, salt_length);
    const iv = buffer.slice(salt_length, salt_length + iv_length);
    const encrypted = buffer.slice(salt_length + iv_length);
    const passwordKey = await getPasswordKey(key);
    const aesKey = await deriveKey(passwordKey, salt, ['encrypt', 'decrypt']);
    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        aesKey,
        encrypted,
    );
    return new TextDecoder().decode(decrypted);
}

const generateSHA256Hash = async (data: string): Promise<string> => {
    // WebCrypto
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return bufferToChars(new Uint8Array(hashBuffer));
}

const verifySHA256Hash = async (data: string, hash: string): Promise<boolean> => {
    // WebCrypto
    const hashBuffer = charsToBuffer(hash);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer2 = new Uint8Array(await crypto.subtle.digest('SHA-256', dataBuffer));
    return hashBuffer.toString() === hashBuffer2.toString();
}

const hashMD5 = async (file: Buffer): Promise<string> => {
    // WebCrypto
    const hashBuffer = await crypto.subtle.digest('MD5', file);
    return bufferToChars(new Uint8Array(hashBuffer));
}

export {
    encryptAES,
    decryptAES,
    generateSHA256Hash,
    verifySHA256Hash,
    hashMD5
}