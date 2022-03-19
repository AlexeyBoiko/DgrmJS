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

		const dgrmChunkVal = await pngChunkGet(input.files[0], 'dgRm');
		if (!dgrmChunkVal) {
			callBack(null);
			return;
		}

		callBack(new TextDecoder().decode(dgrmChunkVal));
	};
	input.click();
}
