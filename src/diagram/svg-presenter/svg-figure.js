/** @implements {IPresenterFigure} */
export class SvgFigure {
	/**
	 * @param {object} param
	 * @param {SVGGraphicsElement} param.svgEl
	 * @param {PresenterElementType} param.type
	 * @param {IPresenterFigure=} param.shape
	 */
	constructor({ svgEl, type, shape = null }) {
		this.type = type;
		this.shape = shape;
	}

	/** @returns {Point} */
	postionGet() {
		throw new Error('Method not implemented.');
	}

	/** @param {PresenterFigureUpdateParam} param */
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

	/**
	 * @param {PresenterElementType} type
	 * @param {PresenterFigureAppendParam | PresenterPathAppendParams} param
	 * @template {IPresenterElement} T
	 * @return {T} */
	appendChild(type, param) {
		throw new Error('Method not implemented.');
	}
}
