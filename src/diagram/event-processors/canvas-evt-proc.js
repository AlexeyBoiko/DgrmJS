/** @implements {IDiagramPrivateEventProcessor} */
export class CanvasEvtProc {
	/**
	 * @param {IDiagramPrivate} diagram
	 */
	constructor(diagram) {
		/** @private */
		this._diagram = diagram;
	}

	/**
	 * @param {IDiagramElement} elem
	 * @return {boolean}
	 */
	canProcess(elem) { return elem.type === 'canvas'; }

	/**
	 * @param {IPresenterShape} shape
	 * @param {IDiagramPrivateEvent} evt
	 */
	process(shape, evt) {
		switch (evt.type) {
			case 'pointermove':
				canvasMove(this._diagram, evt);
				break;
			case 'canvasleave':
			case 'unactive':
			case 'pointerup':
				canvasMoveEnd(this._diagram);
				break;
		}
	}
}

/** delta between shape and cursor when shape start dragging {Point} */
const movedDelta = Symbol(0);

/**
 * @param {IDiagramPrivate} diagram
 * @param {IDiagramPrivateEvent} evt
 */
export function canvasMove(diagram, evt) {
	if (!diagram[movedDelta]) {
		//
		// move start

		diagram.selected = null;
		const canvasPosition = diagram.canvasPosition;
		diagram[movedDelta] = {
			x: canvasPosition.x - evt.detail.clientX,
			y: canvasPosition.y - evt.detail.clientY
		};
	}

	diagram.canvasPosition = {
		x: diagram[movedDelta].x + evt.detail.clientX,
		y: diagram[movedDelta].y + evt.detail.clientY
	};
}

/**
 * @param {IDiagramPrivate} diagram
 */
export function canvasMoveEnd(diagram) {
	delete diagram[movedDelta];
	diagram.selected = null;
}
