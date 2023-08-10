/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {
	Router,
	json,
} from 'itty-router';

import {
	status,
	error
} from 'itty-router-extras'
import {
    router as shortenRouter
} from './routes/shorten';
import {
	router as debugRouter
} from './routes/debug';
import {
	router as fetchRouter
} from './routes/fetch';

import {
	router as unlockRouter
} from './routes/unlock';

import {
	router as qrRouter
} from './routes/qr';

import {
	createCors
} from 'itty-cors';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	URL: KVNamespace;
    BASE_URL: string;
    AES_KEY: string;
    AES_SALT_LENGTH: number;
    AES_IV_LENGTH: number;
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

const router= Router();

const {preflight, corsify} = createCors({
	methods: ['GET', 'POST', 'HEAD'],
	maxAge: 3600,
});



router.all('*', preflight);

router.head('/', async (
	req, env: Env, ctx: ExecutionContext, ...args: any[]
) => {
	return corsify(status(200));
});

router.all('/shorten/*', shortenRouter.handle);

router.all('/fetch/*', fetchRouter.handle);

router.all('/unlock/*', unlockRouter.handle);

router.all('/qr/*', qrRouter.handle);

// DEBUG
// router.all('/debug/*', debugRouter.handle);


router.all('*', () => error(404, 'Not Found'));



export default {
	async fetch(request: Request, ...args: any[]) {
		return router.handle(request, ...args)
			.then(json)
			.catch((e) => {
				console.error(e);
				// return new Response('Internal Server Error', {
				// 	status: 500,
				// });
				return error(500, 'Internal Server Error');
			})
			.then(corsify);
	}
}
