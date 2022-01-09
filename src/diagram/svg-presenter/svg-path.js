/** @implements {IPresenterPath} */
export class SvgPath {
	/**
	 * @param {object} param
	 * @param {SVGGraphicsElement} param.svgEl
	 * @param {PresenterPathEnd} param.start
	 * @param {PresenterPathEnd} param.end
	 */
	constructor({ svgEl, start, end }) {
		/** @private */
		this._svgEl = svgEl;
		this._start = start;
		this._end = end;

		/** @type {PresenterElementType} */
		this.type = 'path';
	}

	/**
	 * @param {PresenterPathEndType} endType
	 * @param {PresenterPathEnd} param
	 * @returns {void}
	 */
	update(endType, param) {
		throw new Error('Method not implemented.');
	}
}
