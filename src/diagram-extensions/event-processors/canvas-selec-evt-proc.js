import { shapeMove, shapeMoveEnd } from '../../diagram/event-processors/shape-evt-proc.js';
import { elemCreateByTemplate } from '../../diagram/svg-presenter/svg-presenter-utils.js';

/** @implements {IDiagramPrivateEventProcessor} */
export class CanvasSelecEvtProc {
	/**
	 * @param {IDiagramPrivate} diagram
	 * @param {SVGSVGElement} svg
	 */
	constructor(diagram, svg) {
		/** @private */
		this._diagram = diagram;

		/** @private */
		this._svg = svg;
	}

	/**
	 * @param {IPresenterShape} canvas
	 * @param {IDiagramPrivateEvent} evt
	 */
	process(canvas, evt) {
		switch (evt.type) {
			case 'pointermove':
				if (this._timer) { clearTimeout(this._timer); }
				if (this._selectRect) {
					rectDraw(this._selectRect, evt);
					return;
				}

				shapeMove(this._diagram, canvas, evt);
				break;

			case 'pointerdown':
				this._diagram.selected = null;

				/** @private */
				this._timer = setTimeout(() => {
					//
					// long tap

					/** @private */
					this._selectRect = rectCreate(this._svg, { x: evt.detail.clientX, y: evt.detail.clientY });
				}, 500);
				break;
			case 'canvasleave':
			case 'pointerup':
				if (this._timer) { clearTimeout(this._timer); }
				if (this._selectRect) {
					this._selectRect.remove();
					this._selectRect = null;
					return;
				}

				shapeMoveEnd(canvas);
				break;
		}
	}
}

/** point where selectRect starts */
const rectStartPoint = Symbol(0);
const rectStartElem = Symbol(0);

/** @typedef {SVGRectElement & { [rectStartPoint]?: Point, [rectStartElem]?: SVGCircleElement }} SelectRect */

/**
 * @param {SVGSVGElement} svg
 * @param {Point} position
 * @return {SVGRectElement}
 */
function rectCreate(svg, position) {
	// TODO: check positon if SVG is not full screen

	const selectRect = /** @type {SelectRect} */(elemCreateByTemplate(svg, 'select'));
	selectRect.x.baseVal.value = position.x;
	selectRect.y.baseVal.value = position.y;
	selectRect[rectStartPoint] = position;

	// circle to show rect start drawing
	selectRect[rectStartElem] = /** @type {SVGCircleElement} */(elemCreateByTemplate(svg, 'select-start'));
	selectRect[rectStartElem].cx.baseVal.value = position.x;
	selectRect[rectStartElem].cy.baseVal.value = position.y;

	return selectRect;
}

/**
 * @param {SelectRect} selectRect
 * @param {IDiagramPrivateEvent} evt
 */
function rectDraw(selectRect, evt) {
	if (selectRect[rectStartElem]) {
		selectRect[rectStartElem].remove();
		delete selectRect[rectStartElem];
	}

	const x = evt.detail.clientX - selectRect[rectStartPoint].x;
	const y = evt.detail.clientY - selectRect[rectStartPoint].y;

	selectRect.width.baseVal.value = Math.abs(x);
	if (x < 0) {
		selectRect.x.baseVal.value = evt.detail.clientX;
	}

	selectRect.height.baseVal.value = Math.abs(y);
	if (y < 0) {
		selectRect.y.baseVal.value = evt.detail.clientY;
	}
}
