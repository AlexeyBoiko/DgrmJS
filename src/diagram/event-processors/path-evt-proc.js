import { shapeStateDel } from '../shape-utils.js';

/** @implements {IDiagramPrivateEventProcessor} */
export class PathEvtProc {
	/**
	 * @param {IDiagramPrivate} diagram
	 */
	constructor(diagram) {
		/** @private */
		this._diagram = diagram;
	}

	/**
	 * @param {IPresenterPath} path
	 * @param {IDiagramPrivateEvent} evt
	 */
	process(path, evt) {
		switch (evt.type) {
			case 'pointerup':
				this._diagram.selected = path;
				break;
			case 'unselect':
				shapeStateDel(path, 'selected');
				break;
		}
	}
}
