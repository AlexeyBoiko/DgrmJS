/**
 * Point in view (in SVG) to point in canvas
 * @param {Point} canvasPosition
 * @param {number} scale
 * @param {Point} point
 * @returns {Point}
 */
export function pointViewToCanvas(canvasPosition, scale, point) {
	return {
		x: (point.x - canvasPosition.x) / scale,
		y: (point.y - canvasPosition.y) / scale
	};
}

/**
 * Point in canvas to point in view (in SVG)
 * @param {Point} canvasPosition
 * @param {number} scale
 * @param {Point} point
 * @returns {Point}
 */
export function pointCanvasToView(canvasPosition, scale, point) {
	return {
		x: point.x * scale + canvasPosition.x,
		y: point.y * scale + canvasPosition.y
	};
}
