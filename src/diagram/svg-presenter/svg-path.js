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
		const coef = 70;
		if (this.point1.shapePosition.shape === shapePosition.shape) {
			// const x = this._start.position;
			const y = this.point1.innerPosition.y + shapePosition.position.y;
			/** @private */
			this._p1Part = `M ${x} ${y} C ${SvgPath._cx(this.point1.dir, x, coef)} ${SvgPath._cy(this.point1.dir, y, coef)}, `;
		}

		if (this.point2.shapePosition.shape === shapePosition.shape) {
			const x = this.point2.innerPosition.x + shapePosition.position.x;
			const y = this.point2.innerPosition.y + shapePosition.position.y;
			/** @private */
			this._p2Part = `${SvgPath._cx(this.point2.dir, x, coef)} ${SvgPath._cy(this.point2.dir, y, coef)}, ${x} ${y}`;
		}

		return `${this._p1Part}${this._p2Part}`;
	}

	/**
	 * @param {number} coef
	 * @param {PresenterPathEnd} start
	 * @param {PresenterPathEnd} end
	 */
	static _calcDAttr(coef, start, end) {
		`M ${start.position.x} ${start.position.y} C ${SvgPath._cx(start.dir, start.position.x, coef)} ${SvgPath._cy(start.dir, start.position.y, coef)}, `
	}

	/**
	 * @param {PresenterPathEndDirection} dir
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
	 * @param {PresenterPathEndDirection} dir
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
