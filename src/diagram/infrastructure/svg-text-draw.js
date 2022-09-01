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
