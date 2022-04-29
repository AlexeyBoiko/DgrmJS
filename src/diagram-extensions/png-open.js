import { pngChunkGet } from './infrastructure/png-chunk-utils.js';

/**
 * @param {Blob} png
 * @returns {Promise<string|null>}
 */
export async function pngDgrmChunkGet(png) {
	const dgrmChunkVal = await pngChunkGet(png, 'dgRm');
	if (!dgrmChunkVal) { return null; }
	return new TextDecoder().decode(dgrmChunkVal);
}
