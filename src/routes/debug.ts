import {
    Router
} from 'itty-router';
import { error } from 'itty-router-extras';

export const router = Router({
    base: '/debug',
});


router.get('/create/:key/:value', async (
    req, env, ctx, ...args
) => {
    let key = req.params.key;
    let value = req.params.value;
    if (!key) {
        return error(400, 'Missing key');
    }
    if (!value) {
        return error(400, 'Missing value');
    }
    await env.URL.put(key, value);
    return new Response('OK');
});

router.get('/read/:key', async (
    req, env, ctx, ...args
) => {
    let key = req.params.key;
    if (!key) {
        return error(400, 'Missing key');
    }
    let value = await env.URL.get(key);
    return new Response(value === '' ? 'Empty' : value || 'Not found');
});

router.get('/update/:key/:value', async (
    req, env, ctx, ...args
) => {
    let key = req.params.key;
    let value = req.params.value;
    if (!key) {
        return error(400, 'Missing key');
    }
    if (!value) {
        return error(400, 'Missing value');
    }
    await env.URL.put(key, value);
    return new Response('OK');
});

router.get('/delete/:key', async (
    req, env, ctx, ...args
) => {
    let key = req.params.key;
    if (!key) {
        return error(400, 'Missing key');
    }
    await env.URL.delete(key);
    return new Response('OK');
});

router.get('/list', async (
    req, env, ctx, ...args
) => {
    interface ret {
        key: string;
        value: string;
    }
    let rets: ret[] = [];
    let keys = await env.URL.list();
    for (let key of keys.keys) {
        let value = await env.URL.get(key.name);
        rets.push({
            key: key.name,
            value: value
        });
    }
    return new Response(JSON.stringify(rets));
});

router.get('/clear', async (
    req, env, ctx, ...args
) => {
    let keys = await env.URL.list();
    for (let key of keys.keys) {
        await env.URL.delete(key.name);
    }
    return new Response('OK');
});

