import { CanvasSelecEvtProc } from '../../../diagram-extensions/group-select/canvas-selec-evt-proc.js';
import { pnlDel, pnlDelShow } from '../panel-create.js';

export class AppCanvasSelecEvtProc extends CanvasSelecEvtProc {
	/**
	 * @param {IDiagramPrivate} diagram
	 * @param {SVGSVGElement} svg
	 */
	constructor(diagram, svg) {
		super(diagram, svg);
		diagram.on('scale', _ => pnlDel(this));
	}

	/**
	 * when click on one of selected shapes
	 * @param {IDiagramPrivateEvent} evt
	 */
	onShapeClick(evt) {
		pnlDelShow(this, evt.detail.clientX - 20, evt.detail.clientY - 55, () => {
			for (const shape of this.selectedShapes) {
				this.diagram.del(shape);
			}
		});
	}

	onSelectedClean() {
		pnlDel(this);
		super.onSelectedClean();
	}

	/**
	 * @param {IDiagramElement} elem
	 * @param {IDiagramPrivateEvent} evt
	 */
	process(elem, evt) {
		pnlDel(this);
		super.process(elem, evt);
	}
}
