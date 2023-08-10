import {
    Router,
} from 'itty-router';
import { error } from 'itty-router-extras';
import { Env } from '../worker';
import {
    encryptAES,
    generateSHA256Hash,
    hashMD5,
} from '../functions/crypto';

import * as qr from 'qr-image';

import { URLValidator, backhalfValidator, passwordValidator } from '../functions/validator';
import { check_key_exists, random_unique_id } from '../functions/common';
interface ShortenRequest {
	url: string;
	backhalf?: string;
	password?: string;
	qrcode?: boolean;
}

interface URLEntry {
    original_url_encrypted: string;
    password_hashed?: string;
}

interface ShortenResponse {
	short_url: string;
	qrcode_b64?: string;
    qrcode_checksum?: string;
	original_url_encrypted: string;
	backhalf_hashed?: string;
	password_hashed?: string;
}
export const router = Router({
    base: '/shorten',
});
router.post('/', async (
	req, env: Env, ctx: ExecutionContext, ...args: any[]
) => {
	let body: ShortenRequest;
	try {
		body = await req.json() as ShortenRequest;

	} catch (e) {
		return error(400, 'Invalid JSON');
	}
    let body_keys = Object.keys(body);
    let allowedKeys = ['url', 'backhalf', 'password', 'qrcode'];
    let extraKeys = body_keys.filter((key) => !allowedKeys.includes(key));
    if (extraKeys.length > 0) {
        return error(400, `Invalid keys: ${extraKeys.join(', ')}`);
    }
    if (!body.url) {
        return error(400, 'Missing URL');
    }
    // VALIDATION
    let urlValidation = URLValidator(body.url);
    if (!urlValidation.valid) {
        return error(400, urlValidation.reason);
    }
    if (body.backhalf) {
        let backhalfValidation = backhalfValidator(body.backhalf);
        if (!backhalfValidation.valid) {
            return error(400, backhalfValidation.reason);
        }
        if (await check_key_exists(env.URL, body.backhalf)) {
            return error(400, 'Backhalf already exists');
        }
    }
    if (body.password) {
        let passwordValidation = passwordValidator(body.password);
        if (!passwordValidation.valid) {
            return error(400, passwordValidation.reason);
        }
    }

    let backhalf = body.backhalf || await random_unique_id(env.URL, 8);
    let backhalf_hashed = await generateSHA256Hash(backhalf);
    let encryptedURL = await encryptAES(body.url, env.AES_KEY, env.AES_SALT_LENGTH, env.AES_IV_LENGTH);
    let hashedPwd = body.password ? await generateSHA256Hash(body.password) : undefined;
    let entry: URLEntry = {
        original_url_encrypted: encryptedURL,
    };
    if (hashedPwd) {
        entry.password_hashed = hashedPwd;
    }
    await env.URL.put(backhalf_hashed, JSON.stringify(entry));

    let response: ShortenResponse = {
        short_url: `${env.BASE_URL}/${backhalf}`,
        original_url_encrypted: encryptedURL,
        backhalf_hashed,
    };

    if (body.qrcode) {
        let qr_image = qr.imageSync(response.short_url, { type: 'png' });
        let qr_b64 = qr_image.toString('base64');
        response.qrcode_b64 = qr_b64;
        response.qrcode_checksum = await hashMD5(qr_image as Buffer);
    }
    if (hashedPwd) {
        response.password_hashed = hashedPwd;
    }
    return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
})

export type {
    URLEntry,
}