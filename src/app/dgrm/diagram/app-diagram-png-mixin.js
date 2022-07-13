import { pngDgrmCreate, pngDgrmChunkGet } from '../../../diagram-extensions/png.js';

/**
 * @type {IAppPngExportable}
 * @mixin
 */
export const AppDiagramPngMixin = {
	/**
	 * @this IAppDiagramSerializable
	 * @param {BlobCallback} callBack
	 */
	pngCreate(callBack) {
		const diagramData = this.dataGet();
		if (!diagramData) { callBack(null); return; }
		pngDgrmCreate(this.svg, callBack, JSON.stringify(diagramData));
	},

	/**
	 * @this IAppDiagramSerializable
	 * @param {Blob} png
	 * @returns {Promise<Boolean>}
	 */
	async pngLoad(png) {
		const dgrmChunk = await pngDgrmChunkGet(png);
		if (!dgrmChunk) { return false; }
		this.dataSet(JSON.parse(dgrmChunk));
		return true;
	}
};
