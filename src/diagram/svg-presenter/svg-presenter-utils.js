/**
 * @param {Set<PresenterShapeState>} states
 * @param {SVGGraphicsElement} svgEl
 * @param {PresenterShapeState} state
 */
export function stateClassSync(states, svgEl, state) {
	if (states.has(state)) { svgEl.classList.add(state); } else { svgEl.classList.remove(state); }
}
