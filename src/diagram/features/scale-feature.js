/**
 * @param {IDiagram} diagram
 * @param {SVGSVGElement} svg
 */
export function scaleFeature(diagram, svg) {
	const scaleStep = 0.25;
	svg.addEventListener('wheel', /** @param {WheelEvent} evt */ evt => {
		diagram.selected = null;

		const nextScale = diagram.scale + (evt.deltaY < 0 ? scaleStep : -scaleStep);
		if (nextScale < scaleStep || nextScale > 4) { return; }

		diagram.scaleSet(nextScale, { x: evt.clientX, y: evt.clientY });
	});
}
