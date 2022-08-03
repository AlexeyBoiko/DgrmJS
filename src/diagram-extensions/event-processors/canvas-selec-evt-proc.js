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
					const x = evt.detail.clientX - this._selectRectStartPoint.x;
					const y = evt.detail.clientY - this._selectRectStartPoint.y;

					this._selectRect.width.baseVal.value = Math.abs(x);
					if (x < 0) {
						this._selectRect.x.baseVal.value = evt.detail.clientX;
					}

					this._selectRect.height.baseVal.value = Math.abs(y);
					if (y < 0) {
						this._selectRect.y.baseVal.value = evt.detail.clientY;
					}

					return;
				}

				shapeMove(this._diagram, canvas, evt);
				break;

			case 'pointerdown':
				/** @private */
				this._timer = setTimeout(() => this._longTap({ x: evt.detail.clientX, y: evt.detail.clientY }), 500);
				break;
			case 'canvasleave':
			case 'pointerup':
				if (this._timer) { clearTimeout(this._timer); }

				if (this._selectRect) {
					this._selectRect.remove();
					this._selectRect = null;
					this._selectRectStartPoint = null;
					return;
				}

				shapeMoveEnd(canvas);
				break;
		}
	}

	/**
	 * @param {Point} position
	 * @private
	 */
	_longTap(position) {
		/** @private */
		this._selectRect = /** @type {SVGRectElement} */(elemCreateByTemplate(this._svg, 'select'));

		const center = parseCenterAttr(this._selectRect);

		/**
		 * @type {Point}
		 * @private
		 */
		this._selectRectStartPoint = {
			x: position.x - center.x,
			y: position.y - center.y
		};

		// TODO: check positon if SVG is not full screen
		this._selectRect.x.baseVal.value = this._selectRectStartPoint.x;
		this._selectRect.y.baseVal.value = this._selectRectStartPoint.y;
	}
}
