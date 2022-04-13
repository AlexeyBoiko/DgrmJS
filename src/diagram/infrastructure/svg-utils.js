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
 * @param {SVGTextElement} textEl target text element
 * @param {string} str
 * @param {{lineHeight:number, verticalMiddle?:number}} param
 * @returns {void}
 */
export function svgTextDraw(textEl, str, param) {
	textEl.innerHTML = svgStrToTspan(str,
		textEl.x?.baseVal[0]?.value ?? 0,
		param.lineHeight);

	if (param.verticalMiddle != null) {
		textEl.y.baseVal[0].value = param.verticalMiddle - textEl.getBBox().height / 2;
	}
}

/**
 * create multiline tspan markup
 * @param {string} str
 * @param {number} x
 * @param {number} lineHeight
 * @returns {string}
 */
function svgStrToTspan(str, x, lineHeight) {
	return str.split('\n').map((t, i) => {
		return `<tspan x="${x}" dy="${i === 0 ? '.4em' : `${lineHeight}px`}" ${t.length === 0 ? 'visibility="hidden"' : ''}>${t.length === 0 ? '.' : escapeHtml(t).replaceAll(' ', '&nbsp;')}</tspan>`;
	}).join('');
}

/**
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
	return str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
