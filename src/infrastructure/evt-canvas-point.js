/**
 * Get point in canvas given the scale and position of the canvas
 * @param { {position:{x:number, y:number}, scale:number} } canvasData
 * @param { PointerEvent } evt
 */
export function evtCanvasPoint(canvasData, evt) {
	return {
		x: (evt.clientX - canvasData.position.x) / canvasData.scale,
		y: (evt.clientY - canvasData.position.y) / canvasData.scale
	};
}
