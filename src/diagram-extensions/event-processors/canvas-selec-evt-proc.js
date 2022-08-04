import { shapeMove, shapeMoveEnd } from '../../diagram/event-processors/shape-evt-proc.js';
import { elemCreateByTemplate } from '../../diagram/svg-presenter/svg-presenter-utils.js';
import { parseCenterAttr } from '../svg-utils.js';

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

/** @typedef {SVGRectElement & { [rectStartPoint]?: Point }} SelectRect */

/**
 * @param {SVGSVGElement} svg
 * @param {Point} position
 * @return {SVGRectElement}
 */
function rectCreate(svg, position) {
	const selectRect = /** @type {SelectRect} */(elemCreateByTemplate(svg, 'select'));

	const center = parseCenterAttr(selectRect);

	selectRect[rectStartPoint] = {
		x: position.x - center.x,
		y: position.y - center.y
	};

	// TODO: check positon if SVG is not full screen
	selectRect.x.baseVal.value = selectRect[rectStartPoint].x;
	selectRect.y.baseVal.value = selectRect[rectStartPoint].y;

	return selectRect;
}

/**
 * @param {SelectRect} selectRect
 * @param {IDiagramPrivateEvent} evt
 */
function rectDraw(selectRect, evt) {
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
