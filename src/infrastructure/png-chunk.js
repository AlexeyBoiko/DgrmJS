/**
 * @param {Blob} png
 * @param {string} chunkName 4 symbol string
 * @returns {Promise<DataView | null>} chunk data
 */
export async function pngChunkGet(png, chunkName) {
	return chunkGet(
		await png.arrayBuffer(),
		toUit32(chunkName));
}

/**
 * @param {Blob} png
 * @param {string} chunkName 4 symbol string
 * @param {Uint8Array} data
 * @returns {Promise<Blob>} new png
 */
export async function pngChunkSet(png, chunkName, data) {
	return chunkSet(
		await png.arrayBuffer(),
		toUit32(chunkName),
		data
	);
}

/**
 * @param {ArrayBuffer} pngData
 * @param {number} chunkNameUint32 chunk name as Uint32
 * @param {Uint8Array} data
 * @returns {Blob} new png
 */
function chunkSet(pngData, chunkNameUint32, data) {
	/** @type {DataView} */
	let startPart;
	/** @type {DataView} */
	let endPart;

	const existingChunk = chunkGet(pngData, chunkNameUint32);
	if (existingChunk) {
		startPart = new DataView(pngData, 0, existingChunk.byteOffset - 8);
		endPart = new DataView(pngData, existingChunk.byteOffset + existingChunk.byteLength + 4);
	} else {
		const endChunkStart = pngData.byteLength - 12; // 12 - end chunk length
		startPart = new DataView(pngData, 0, endChunkStart);
		endPart = new DataView(pngData, endChunkStart);
	}

	const chunkHeader = new DataView(new ArrayBuffer(8));
	chunkHeader.setUint32(0, data.length);
	chunkHeader.setUint32(4, chunkNameUint32);

	return new Blob([
		startPart,

		// new chunk
		chunkHeader,
		data,
		new Uint32Array([0]),	// CRC fake - not calculated

		endPart
	],
	{ type: 'image/png' });
}

/**
 * @param {ArrayBuffer} pngData
 * @param {number} chunkNameUint32 chunk name as Uint32
 * @returns {DataView | null} chunk data
 */
function chunkGet(pngData, chunkNameUint32) {
	const dataView = new DataView(pngData, 8); // 8 byte - png signature

	let chunkPosition = 0;
	let chunkUint = dataView.getUint32(4);
	let chunkLenght;
	while (chunkUint !== 1229278788) { // last chunk 'IEND'
		chunkLenght = dataView.getUint32(chunkPosition);
		if (chunkUint === chunkNameUint32) {
			return new DataView(pngData, chunkPosition + 16, chunkLenght);
		}
		chunkPosition = chunkPosition + 12 + chunkLenght;
		chunkUint = dataView.getUint32(chunkPosition + 4);
	}
	return null;
}

/**
 * @param {string} chunkName 4 symbol string
 * @return {number} uit32
 */
function toUit32(chunkName) {
	return new DataView((new TextEncoder()).encode(chunkName).buffer).getUint32(0);
}
