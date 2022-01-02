/** @typedef {{shape:SVGGElement, position:Point}} ShapePosition */

/**
 * @typedef {Object} ConnectorPoint
 * @property {ShapePosition} shapePosition
 * @property {Point} innerPosition position into share
 * @property {SVGElement} connectorElem svg element into shape where connector starts or ends
 * @property {ConnectorDirection=} dir
 */

export class ConnectorData {
	/**
	 * @param {ConnectorPoint} point1
	 * @param {ConnectorPoint} point2
	 */
	constructor(point1, point2) {
		this.point1 = point1;
		this.point2 = point2;

		this.updatePath(point1.shapePosition);
		this.updatePath(point2.shapePosition);
	}

	/**
	 * @return {string} svgPath 'd' attr
	 */
	path() {
		return `${this._p1Part}${this._p2Part}`;
	}

	/**
	 * @param {ShapePosition} shapePosition shape that change position
	 * @return {string} svgPath 'd' attr
	 */
	updatePath(shapePosition) {
		const coef = 70;
		if (this.point1.shapePosition.shape === shapePosition.shape) {
			const x = this.point1.innerPosition.x + shapePosition.position.x;
			const y = this.point1.innerPosition.y + shapePosition.position.y;
			/** @private */
			this._p1Part = `M ${x} ${y} C ${ConnectorData._cx(this.point1.dir, x, coef)} ${ConnectorData._cy(this.point1.dir, y, coef)}, `;
		}

		if (this.point2.shapePosition.shape === shapePosition.shape) {
			const x = this.point2.innerPosition.x + shapePosition.position.x;
			const y = this.point2.innerPosition.y + shapePosition.position.y;
			/** @private */
			this._p2Part = `${ConnectorData._cx(this.point2.dir, x, coef)} ${ConnectorData._cy(this.point2.dir, y, coef)}, ${x} ${y}`;
		}

		return `${this._p1Part}${this._p2Part}`;
	}

	/**
	 * @param {ConnectorDirection} dir
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
	 * @param {ConnectorDirection} dir
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
