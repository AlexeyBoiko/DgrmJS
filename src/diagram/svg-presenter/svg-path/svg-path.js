/** @implements {ISvgPresenterElement} */
export class SvgPath {
	/**
	 * @param {object} param
	 * @param {SVGPathElement} param.svgEl
	 * @param {PresenterPathEnd} param.start
	 * @param {PresenterPathEnd} param.end
	 */
	constructor({ svgEl, start, end }) {
		this.svgEl = svgEl;
		this._start = start;
		this._end = end;

		/** @type {DiagramElementType} */
		this.type = 'path';
		this._update();
	}

	/**
	 * @param {PresenterPathUpdateParam} param
	 * @returns {void}
	 */
	update(param) {
		if (param.start) { Object.assign(this._start, param.start); }
		if (param.end) { Object.assign(this._end, param.end); }
		this._update();
	}

	/** @private */
	_update() {
		this.svgEl.setAttribute('d', SvgPath._calcDAttr(70, this._start, this._end));
	}

	/**
	 * @param {number} coef
	 * @param {PresenterPathEnd} start
	 * @param {PresenterPathEnd} end
	 * @returns {string}
	 * @private
	 */
	static _calcDAttr(coef, start, end) {
		return `M ${start.position.x} ${start.position.y} C ${SvgPath._cx(start.dir, start.position.x, coef)} ${SvgPath._cy(start.dir, start.position.y, coef)}, ` +
			`${SvgPath._cx(end.dir, end.position.x, coef)} ${SvgPath._cy(end.dir, end.position.y, coef)}, ${end.position.x} ${end.position.y}`;
	}

	/**
	 * @param {DiagramPathEndDirection} dir
	 * @param {number} x
	 * @param {number} coef
	 * @return {number}
	 * @private
	 */
	static _cx(dir, x, coef) {
		return (dir === 'right' || dir === 'left')
			? dir === 'right' ? x + coef : x - coef
			: x;
	}

	/**
	 * @param {DiagramPathEndDirection} dir
	 * @param {number} y
	 * @param {number} coef
	 * @return {number}
	 * @private
	 */
	static _cy(dir, y, coef) {
		return (dir === 'right' || dir === 'left')
			? y
			: dir === 'bottom' ? y + coef : y - coef;
	}
}
