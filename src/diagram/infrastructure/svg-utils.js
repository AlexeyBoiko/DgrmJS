import { first } from '../infrastructure/iterable-utils.js';

/**
 * @param {SVGGraphicsElement} svgEl
 * @param {number} transform
 * @param {SVGSVGElement=} svg pass if svgEl not yet in DOM
 * @returns {SVGTransform}
 */
function ensureTransform(svgEl, transform, svg) {
	let tr = first(svgEl.transform.baseVal, tt => tt.type === transform);
	if (!tr) {
		tr = (svgEl.ownerSVGElement || svg).createSVGTransform();
		svgEl.transform.baseVal.appendItem(tr);
	}
	return tr;
}

/**
* @param {SVGGraphicsElement} svgEl
* @param { {x: number, y: number} } position
* @param {SVGSVGElement=} svg pass if svgEl not yet in DOM
* @returns {void}
*/
export function svgPositionSet(svgEl, position, svg) {
	ensureTransform(svgEl, SVGTransform.SVG_TRANSFORM_TRANSLATE, svg).setTranslate(position.x, position.y);
}

/**
 * @param {SVGGraphicsElement} svgEl
 * @returns { {x: number, y: number} }
 */
export function svgPositionGet(svgEl) {
	const mtx = ensureTransform(svgEl, SVGTransform.SVG_TRANSFORM_TRANSLATE).matrix;
	return {
		x: mtx.e,
		y: mtx.f
	};
}

/**
 * @param {SVGGraphicsElement} svgEl
 * @param {number} angle
 * @param {SVGSVGElement=} svg pass if svgEl not yet in DOM
 * @returns {void}
 */
export function svgRotate(svgEl, angle, svg) {
	ensureTransform(svgEl, SVGTransform.SVG_TRANSFORM_ROTATE, svg).setRotate(angle, 0, 0);
}

/**
 * create multiline tspan markap
 * @param {number} lineHeight
 * @param {string} str
 * @returns {string}
 */
export function svgStrToTspan(str, lineHeight) {
	return str.split('\n').map((t, i) => {
		return `<tspan x="0" dy="${i === 0 ? '.4em' : `${lineHeight}px`}" ${t.length === 0 ? 'visibility="hidden"' : ''}>${t.length === 0 ? '.' : t}</tspan>`;
	}).join('\n');
}
