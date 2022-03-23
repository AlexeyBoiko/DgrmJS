import { pngChunkGet } from './infrastructure/png-chunk-utils.js';

/**
 * @param {function(string?=):void} callBack
 */
export function pngOpen(callBack) {
	const input = document.createElement('input');
	input.type = 'file';
	input.multiple = false;
	input.accept = '.png';
	input.onchange = async function() {
		if (!input.files?.length) { return; }
		callBack(await pngDgrmChunkGet(input.files[0]));
	};
	input.click();
}

/**
 * @param {Blob} png
 * @returns {Promise<string|null>}
 */
export async function pngDgrmChunkGet(png) {
	const dgrmChunkVal = await pngChunkGet(png, 'dgRm');
	if (!dgrmChunkVal) { return null; }
	return new TextDecoder().decode(dgrmChunkVal);
}
