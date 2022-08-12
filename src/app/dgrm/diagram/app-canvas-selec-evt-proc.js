import { CanvasSelecEvtProc } from '../../../diagram-extensions/group-select/canvas-selec-evt-proc.js';
import { panelCreate } from '../panel-create.js';

export class AppCanvasSelecEvtProc extends CanvasSelecEvtProc {
	/**
	 * when click on one of selected shapes
	 * @param {IDiagramPrivateEvent} evt
	 */
	onShapeClick(evt) {
		/** @private */
		this._panel = panelCreate(evt.detail.clientX - 20, evt.detail.clientY - 55);
		this._panel.onclick = _ => {
			this._panelDel();
			for (const shape of this.selectedShapes) {
				this.diagram.del(shape);
			}
		};
	}

	onSelectedClean() {
		this._panelDel();
		super.onSelectedClean();
	}

	/**
	 * @param {IDiagramElement} elem
	 * @param {IDiagramPrivateEvent} evt
	 */
	process(elem, evt) {
		this._panelDel();
		super.process(elem, evt);
	}

	/** @private */
	_panelDel() {
		if (this._panel) {
			this._panel.remove();
			this._panel = null;
		}
	}
}
