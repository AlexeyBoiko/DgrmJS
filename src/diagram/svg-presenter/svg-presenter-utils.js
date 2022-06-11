/**
 * @param {Set<DiagramShapeState>} states
 * @param {SVGGraphicsElement} svgEl
 * @param {DiagramShapeState} state
 */
export function stateClassSync(states, svgEl, state) {
	if (states.has(state)) { svgEl.classList.add(state); } else { svgEl.classList.remove(state); }
}
