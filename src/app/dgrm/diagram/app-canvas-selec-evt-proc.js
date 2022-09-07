import { CanvasSelecEvtProc } from '../../../diagram-extensions/group-select/canvas-selec-evt-proc.js';
import { delBtnDel, delBtnShow } from '../panel-create.js';

export class AppCanvasSelecEvtProc extends CanvasSelecEvtProc {
	/**
	 * @param {IDiagramPrivate} diagram
	 * @param {SVGSVGElement} svg
	 */
	constructor(diagram, svg) {
		super(diagram, svg);
		diagram.on('scale', _ => delBtnDel(this));
	}

	/**
	 * when click on one of selected shapes
	 * @param {IDiagramPrivateEvent} evt
	 */
	onShapeClick(evt) {
		delBtnShow(this, evt.detail.clientX - 20, evt.detail.clientY - 55, () => {
			for (const shape of this.selectedShapes) {
				this.diagram.del(shape);
			}
		});
	}

	onSelectedClean() {
		delBtnDel(this);
		super.onSelectedClean();
	}

	/**
	 * @param {IDiagramElement} elem
	 * @param {IDiagramPrivateEvent} evt
	 */
	process(elem, evt) {
		delBtnDel(this);
		super.process(elem, evt);
	}
}
