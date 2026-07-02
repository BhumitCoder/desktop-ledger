import { webcrypto } from "node:crypto";
//#region node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
//#endregion
//#region node_modules/nanoid/index.js
var POOL_SIZE_MULTIPLIER = 128;
var pool, poolOffset;
function fillPool(bytes) {
	if (bytes < 0) throw new RangeError("Wrong ID size");
	try {
		if (!pool || pool.length < bytes) {
			pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
			webcrypto.getRandomValues(pool);
			poolOffset = 0;
		} else if (poolOffset + bytes > pool.length) {
			webcrypto.getRandomValues(pool);
			poolOffset = 0;
		}
	} catch (e) {
		pool = void 0;
		throw e;
	}
	poolOffset += bytes;
}
function nanoid(size = 21) {
	fillPool(size |= 0);
	let id = "";
	for (let i = poolOffset - size; i < poolOffset; i++) id += urlAlphabet[pool[i] & 63];
	return id;
}
//#endregion
export { nanoid as t };
