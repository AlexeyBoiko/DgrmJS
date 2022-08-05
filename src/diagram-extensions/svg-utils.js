/**
 * @param {SVGGraphicsElement} svgEl
 * @returns {Point}
 */
export function parseCenterAttr(svgEl) {
	const point = svgEl.getAttribute('data-center').split(',');
	return { x: parseFloat(point[0]), y: parseFloat(point[1]) };
}
