import {
    Router
} from 'itty-router';
import { error } from 'itty-router-extras';
import { decryptAES, generateSHA256Hash } from '../functions/crypto';

export const router = Router({
    base: '/fetch',
});

router.get('/:key', async (
    req, env, ctx, ...args
) => {
    let key = req.params.key;
    if (!key) {
        return error(400, 'Missing key');
    }
    let value = await JSON.parse(await env.URL.get(await generateSHA256Hash(key)));
    if (!value) {
        return error(404, 'Not found');
    } else if (value === '') {
        return error(400, 'Empty');
    } else if (value.password_hashed) {
        return error(401, 'Password required');
    } else {
        let decryptedURL = await decryptAES(
            value.original_url_encrypted,
            env.AES_KEY,
            env.AES_SALT_LENGTH,
            env.AES_IV_LENGTH
        );
        let response = {
            url: decryptedURL,
        }
        return new Response(JSON.stringify(response), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
});