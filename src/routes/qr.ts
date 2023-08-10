import {
    Router
} from 'itty-router';

import * as qr from 'qr-image';
import { hashMD5 } from '../functions/crypto';
import {
    error
} from 'itty-router-extras'
import { URLValidator } from '../functions/validator';

export const router = Router({
    base: '/qr',
});

router.get('/', async (
    req, env, ctx, ...args
) => {
    let url = req.query.url?.toString();
    if (!url) {
        return error(400, 'Missing URL');
    }
    let urlValidation = URLValidator(url);
    if (!urlValidation.valid) {
        return error(400, urlValidation.reason);
    }
    let qr_image = qr.imageSync(url, {
        type: 'png',
    });
    let qr_b64 = qr_image.toString('base64');
    let checksum = await hashMD5(qr_image as Buffer);
    return new Response(JSON.stringify({
        qrcode_b64: qr_b64,
        qrcode_checksum: checksum,
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
});
