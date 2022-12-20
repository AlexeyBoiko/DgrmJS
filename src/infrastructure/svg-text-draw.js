/**
 * @param {SVGTextElement} textEl target text element
 * @param {number} verticalMiddle
 * @param {string} str
 * @returns {void}
 */
export function svgTextDraw(textEl, verticalMiddle, str) {
	const strData = svgStrToTspan(
		(str || ''),
		textEl.x?.baseVal[0]?.value ?? 0);

	textEl.innerHTML = strData.s;

	textEl.y.baseVal[0].newValueSpecifiedUnits(
		textEl.y.baseVal[0].SVG_LENGTHTYPE_EMS, // em
		strData.c > 0 ? verticalMiddle - (strData.c) / 2 : verticalMiddle);
}

/**
 * create multiline tspan markup
 * @param {string} str
 * @param {number} x
 * @returns { {s:string, c:number} }
 */
function svgStrToTspan(str, x) {
	let c = 0;
	return {
		s: str.split('\n')
			.map((t, i) => {
				c = i;
				return `<tspan x="${x}" dy="${i === 0 ? 0.41 : 1}em" ${t.length === 0 ? 'visibility="hidden"' : ''}>${t.length === 0 ? '.' : escapeHtml(t).replaceAll(' ', '&nbsp;')}</tspan>`;
			}).join(''),
		c
	};
}

/**
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
	return str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
