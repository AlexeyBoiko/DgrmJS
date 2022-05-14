import { any } from '../../diagram/infrastructure/iterable-utils.js';

/**
 * Check if text is out of shape
 * @param {SVGTextElement} textEl
 * @param {SVGGeometryElement} shapeEl
 * @param {number} padding
 * @returns {boolean}
 */
export function svgTextIsOut(textEl, shapeEl, padding = 0) {
	return any(textEl.getElementsByTagName('tspan'), span => {
		const box = span.getBBox();
		const leftX = box.x - padding;
		const rightX = box.x + box.width + padding;
		const topY = box.y - padding;
		const bottomY = box.y + box.height + padding;
		return !isPointInShape(shapeEl, leftX, topY) || // top left
			!isPointInShape(shapeEl, rightX, topY) || // top right
			!isPointInShape(shapeEl, leftX, bottomY) || // bottom left
			!isPointInShape(shapeEl, rightX, bottomY); // bottom right
	});
}

/**
 * @param {SVGGeometryElement} shapeEl
 * @param {*} x
 * @param {*} y
 * @returns {boolean}
 */
function isPointInShape(shapeEl, x, y) {
	const point = shapeEl.ownerSVGElement.createSVGPoint();
	point.x = x;
	point.y = y;
	return shapeEl.isPointInFill(point) || shapeEl.isPointInStroke(point);
}
