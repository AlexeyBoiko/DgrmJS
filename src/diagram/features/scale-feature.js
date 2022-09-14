/**
 * @param {IDiagram} diagram
 * @param {SVGSVGElement} svg
 */
export function scaleFeature(diagram, svg) {
	svg.addEventListener('wheel', /** @param {WheelEvent} evt */ evt => {
		evt.preventDefault();

		diagram.selected = null;
		const delta = evt.deltaY || evt.deltaX;

		const scaleStep = Math.abs(delta) < 50
			? 0.05 // trackpad pitch
			: 0.25; // mouse wheel
		const nextScale = diagram.scale + (delta < 0 ? scaleStep : -scaleStep);
		if (nextScale < 0.25 || nextScale > 4) { return; }

		diagram.scaleSet(nextScale, { x: evt.clientX, y: evt.clientY });
	});
}
