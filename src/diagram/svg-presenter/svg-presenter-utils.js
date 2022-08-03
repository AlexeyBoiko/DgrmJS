/**
 * @param {Set<DiagramShapeState>} states
 * @param {SVGGraphicsElement} svgEl
 * @param {DiagramShapeState} state
 */
export function stateClassSync(states, svgEl, state) {
	if (states.has(state)) { svgEl.classList.add(state); } else { svgEl.classList.remove(state); }
}

/**
 * @param {SVGSVGElement} svg
 * @param {string} templateKey
 * @returns {SVGGeometryElement}
 */
export function templateGet(svg, templateKey) {
	return svg.getElementsByTagName('defs')[0]
		.querySelector(`[data-templ='${templateKey}']`);
}

/**
 * clone DOM element with {templateKey} and add to svg
 * @param {SVGGElement | SVGSVGElement} svgParent parent SVG el where to add child
 * @param {string} templateKey
 * @returns {SVGGeometryElement}
 */
export function elemCreateByTemplate(svgParent, templateKey) {
	const el = templateGet(svgParent.ownerSVGElement ?? /** @type {SVGSVGElement} */(svgParent), templateKey).cloneNode(true);
	svgParent.append(el);
	return /** @type {SVGGeometryElement} */(el);
}
