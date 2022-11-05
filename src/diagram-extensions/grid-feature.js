/**
 * @param {IDiagram} diagram
 * @param {SVGSVGElement} svg
 */
export function gridFeature(diagram, svg) {
	let curOpacity;

	/** @param {number} opacity */
	function backImg(opacity) {
		if (curOpacity !== opacity) {
			curOpacity = opacity;
			svg.style.backgroundImage = `radial-gradient(rgb(73 80 87 / ${opacity}) 1px, transparent 0)`;
		}
	}

	backImg(0.7);

	const cellSize = 24;
	const cellSizeHalf = cellSize / 2;

	/**
	 * @param {number} coordinate
	 * @return {number}
	 */
	function placeToCell(coordinate) {
		const coor = (Math.round(coordinate / cellSize) * cellSize);
		return (coordinate - coor > 0) ? coor + cellSizeHalf : coor - cellSizeHalf;
	}

	svg.style.backgroundSize = `${cellSize}px ${cellSize}px`;

	diagram
		.on('canvmove', _ => {
			const pos = diagram.canvasPosition;
			svg.style.backgroundPosition = `${pos.x}px ${pos.y}px`;
		})
		.on('scale', _ => {
			const pos = diagram.canvasPosition;
			const size = cellSize * diagram.scale;

			if (diagram.scale < 0.5) { backImg(0); } else
			if (diagram.scale <= 0.9) { backImg(0.3); } else { backImg(0.7); }

			svg.style.backgroundSize = `${size}px ${size}px`;
			svg.style.backgroundPosition = `${pos.x}px ${pos.y}px`;
		})
		.on('moveend', /** @param {CustomEvent<IDiagramEventDetail<IDiagramShape>>} evt */ evt => {
			const pos = evt.detail.target.positionGet();
			diagram.shapeUpdate(evt.detail.target, {
				position: {
					x: placeToCell(pos.x),
					y: placeToCell(pos.y)
				}
			});
		});
}
