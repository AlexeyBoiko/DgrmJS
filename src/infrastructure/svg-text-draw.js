/**
 * @param {SVGTextElement} textEl target text element
 * @param {string} str
 * @param {number} verticalMiddle
 * @returns {void}
 */
export function svgTextDraw(textEl, str, verticalMiddle) {
	const strData = svgStrToTspan(
		str,
		textEl.x?.baseVal[0]?.value ?? 0);

	textEl.innerHTML = strData.s;

	if (strData.c > 0) {
		textEl.y.baseVal[0].valueAsString = `${verticalMiddle - (strData.c) / 2}em`;
	}
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
