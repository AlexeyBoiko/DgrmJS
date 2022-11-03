/**
 * @param {IDiagram} diagram
 * @param {SVGSVGElement} svg
 */
export function gridFeature(diagram, svg) {
	let curOpacity;
	function backImg(opacity) {
		if (curOpacity !== opacity) {
			curOpacity = opacity;
			svg.style.backgroundImage = `radial-gradient(rgb(73 80 87 / ${opacity}) 1px, transparent 0)`;
		}
	}

	backImg(0.7);
	svg.style.backgroundSize = '25px 25px';

	diagram
		.on('canvmove', _ => {
			const pos = diagram.canvasPosition;
			svg.style.backgroundPosition = `${pos.x}px ${pos.y}px`;
		})
		.on('scale', _ => {
			const pos = diagram.canvasPosition;
			const size = 25 * diagram.scale;

			if (diagram.scale < 0.5) { backImg(0); } else
			if (diagram.scale <= 0.9) { backImg(0.3); } else { backImg(0.7); }

			svg.style.backgroundSize = `${size}px ${size}px`;
			svg.style.backgroundPosition = `${pos.x}px ${pos.y}px`;
		});
}
