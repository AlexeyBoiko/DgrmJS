/**
 * - get inner element with 'data-key' attr = {dataKey}
 * - clone it, make transparent
 *  - and add to {svgEl}
 * @param {SVGGraphicsElement} svgEl
 * @param {string} dataKey
 * @returns {SVGGraphicsElement}
 */
export function cloneUnshiftTransparent(svgEl, dataKey) {
	const cloned = svgEl.querySelector(`[data-key="${dataKey}"]`);
	const clone = /** @type {SVGGraphicsElement}} */ (cloned.cloneNode(false));
	clone.style.fill = 'transparent';
	clone.style.stroke = 'transparent';
	clone.removeAttribute('data-key');
	svgEl.insertBefore(clone, cloned);
	return clone;
}
