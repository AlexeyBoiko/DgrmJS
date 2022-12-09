/**
 * @param {SVGSVGElement} svg
 * @param {{
		x: number;
    	y: number;
		height: number;
    	width: number;
	}} rect coordinates of the rect to export
 * @param {number} scale
 * @param {BlobCallback} callBack
 */
export function svgToPng(svg, rect, scale, callBack) {
	const img = new Image();
	img.width = rect.width * scale * window.devicePixelRatio;
	img.height = rect.height * scale * window.devicePixelRatio;
	img.onload = function() {
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.style.width = `${img.width}px`;
		canvas.style.height = `${img.height}px`;

		const ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(
			img,
			rect.x, // sx
			rect.y, // sy
			rect.width, // sWidth
			rect.height, // sHeight

			0,	// dx
			0,	// dy
			img.width, // dWidth
			img.height // dHeight
		);
		URL.revokeObjectURL(img.src);

		canvas.toBlob(callBack, 'image/png');
	};
	svg.width.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX, img.width);
	svg.height.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX, img.height);
	img.src = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' }));
}
