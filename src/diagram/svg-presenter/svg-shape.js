/** @implements {IPresenterShape} */
export class SvgShape {
	/**
	 * @param {object} param
	 * @param {SVGGraphicsElement} param.svgEl
	 * @param {boolean=} param.connectable
	 * @param {IPresenterConnector=} param.defaultInConnector
	 */
	constructor({ svgEl, connectable = null, defaultInConnector = null }) {
		/** @private */
		this._svgEl = svgEl;

		/** @type {PresenterElementType} */
		this.type = 'shape';
		this.connectable = connectable;
		this.defaultInConnector = defaultInConnector;
	}

	/** @returns {Point} */
	postionGet() {
		throw new Error('Method not implemented.');
	}

	/** @param {PresenterShapeUpdateParam} param */
	update(param) {
		throw new Error('Method not implemented.');
	}

	select() {
		throw new Error('Method not implemented.');
	}

	unSelect() {
		throw new Error('Method not implemented.');
	}

	hide() {
		throw new Error('Method not implemented.');
	}

	delete() {
		throw new Error('Method not implemented.');
	}
}
