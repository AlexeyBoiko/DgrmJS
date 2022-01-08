/**
 * SVG diagram builder
 * @module svgDiagramBuilder
 */

import { ConnectorData } from './connector-data.js';
import { ConnectorDataStore } from './connector-data-store.js';

/** @typedef {Object.<string, Object.<string, string|number|boolean>>} ShapeProps */
/** @typedef {{shape: SVGGElement, connectorElem: SVGElement}} ShapeConnectPoint */

/** @typedef {'select' | 'move'} EventType */

export class DiagramBuilder extends EventTarget {
	/**
	 * @param {SVGSVGElement} svg
	 */
	constructor(svg) {
		super();

		/** @type {SVGSVGElement} */
		this._svg = svg;

		this._svg.addEventListener('pointermove', this);
		this._svg.addEventListener('pointerdown', this);
		this._svg.addEventListener('pointerup', this);

		/**
		 * @type {SVGGElement}
		 * @private
		 */
		this._allGroup = svg.querySelector('[data-name="all"]');
		this._positionSet(this._allGroup, { x: 0, y: 0 });
		/** @private */
		this._elData = new WeakMap();
		/** @private */
		this._connectorData = new ConnectorDataStore(this._elData);
	}

	/**
	 * subscribe to event
	 * @param {EventType} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(evtType, listener) {
		this.addEventListener(evtType, listener);
		return this;
	}

	/**
	 * @param {Object} param
	 * @param {string} param.templateKey
	 * @param {Point} param.position
	 * @param {boolean=} param.isInner
	 * @param {ShapeProps=} param.props Attributes values of the shape objects.
	 * 'root' - key for outer element.
	 * Other keys for inner elements: key = value of the 'data-name' attribute.
	 * @returns {SVGGraphicsElement|null}
	 */
	shapeAdd({ templateKey, position, isInner, props }) {
		/** @type {SVGGElement} */
		const shape = this._tempClone(templateKey);

		const posit = position;
		if (!isInner) {
			const allGrouoPosition = DiagramBuilder._positionGet(this._allGroup);
			posit.x = posit.x - allGrouoPosition.x;
			posit.y = posit.y - allGrouoPosition.y;
		}
		this._shapeUpdate({ svgG: shape, position: posit, props: props });

		let dragSetted = false;
		if (shape.getAttribute('data-drag') === 'true') {
			shape.addEventListener('pointerdown', this);
			dragSetted = true;
		} else {
			shape.querySelectorAll('[data-drag="true"]')
				.forEach(el => el.addEventListener('pointerdown', this));
		}

		shape.querySelectorAll(dragSetted ? '[data-drag="true"], [data-connect="out"]' : '[data-connect="out"]')
			.forEach(el => el.addEventListener('pointerdown', this));

		shape.querySelectorAll('[data-connect="in"]')
			.forEach(el => {
				el.addEventListener('pointerup', this);
			});

		this._allGroup.appendChild(shape);

		return shape;
	}

	/**
	 * @param {SVGElement} shape
	 */
	shapeDel(shape) {
		this._allGroup.removeChild(shape);
	}

	/**
	 * @param {Object} param
	 * @param {SVGGElement|string} param.elemOrSelector one element selector
	 * @param {Point=} param.position
	 * @param {ShapeProps=} param.props
	 * @returns {SVGGElement|null}
	 */
	shapeUpdate({ elemOrSelector, position = null, props = null }) {
		/** @type {SVGGElement} */
		const shape = (typeof elemOrSelector === 'string')
			? this._allGroup.querySelector(elemOrSelector)
			: elemOrSelector;

		this._shapeUpdate({ svgG: shape, position: position, props: props });
		return shape;
	}

	/**
	 * @param {Object} param
	 * @param {SVGGElement} param.svgG
	 * @param {Point=} param.position
	 * @param {ShapeProps=} param.props
	 * @private
	 */
	_shapeUpdate({ svgG, position = null, props = null }) {
		if (position) {
			this._positionSet(svgG, position);
		}

		if (props) {
			DiagramBuilder._attrsSet(svgG, props);
		}
	}

	/**
	 * @param {Element} elem
	 * @param {ShapeProps} props
	 * @private
	 */
	static _attrsSet(elem, props) {
		Object.keys(props).forEach(name => {
			const shape = (name === 'root')
				? elem
				: elem.querySelector(`[data-name='${name}'`);

			Object.keys(props[name]).forEach(attr => {
				switch (attr) {
					case 'textContent':
						shape.textContent = props[name][attr].toString();
						break;
					case 'data-drag':
					case 'data-connect':
						throw new Error('change of [data-drag/data-connect] attr not implemented');
					default:
						shape.setAttribute(attr, props[name][attr].toString());
						break;
				}
			});
		});
	}

	/**
	 * @param {SVGGraphicsElement} svgEl
	 * @param {Point} position
	 * @private
	 */
	_positionSet(svgEl, position) {
		if (svgEl.transform.baseVal.numberOfItems === 0) {
			const tr = this._svg.createSVGTransform();
			tr.setTranslate(position.x, position.y);
			svgEl.transform.baseVal.appendItem(tr);
		} else {
			// setTranslate transformatin always have index 0
			// for performance
			svgEl.transform.baseVal.getItem(0).setTranslate(position.x, position.y);
		}
	}

	/**
	 * @param {SVGGraphicsElement} svgEl
	 * @return {Point}
	 * @private
	 */
	static _positionGet(svgEl) {
		const matrix = svgEl.transform.baseVal.getItem(0).matrix;
		return {
			x: matrix.e,
			y: matrix.f
		};
	}

	/**
	 *
	 * @param {SVGGraphicsElement} svgEl
	 * @param {PresenterPathEndDirection} dir
	 */
	_rotate(svgEl, dir) {
		// svgEl.transform.baseVal.getItem(0) - always setTranslate
		/** @type {SVGTransform} */
		let rotate = [...svgEl.transform.baseVal].find(tt => tt.type === SVGTransform.SVG_TRANSFORM_ROTATE);
		if (!rotate) {
			rotate = this._svg.createSVGTransform();
			svgEl.transform.baseVal.appendItem(rotate);
		}

		rotate.setRotate(dir === 'left'
			? 0
			: dir === 'right'
				? 180
				: dir === 'top'
					? 90
					: 270,
		0, 0);
	}

	/**
	 * @template {Node} E
	 * @param {string} templateKey
	 * @return {E}
	 * @private
	 */
	_tempClone(templateKey) {
		// @ts-ignore // TODO
		return /** @type {E} */ this._svg.getElementsByTagName('defs')[0]
			.querySelector(`[data-templ='${templateKey}']`)
			.cloneNode(true);
	}

	/**
	 * @param {PointerEvent & { currentTarget: SVGGraphicsElement }} evt
	 * @this {DiagramBuilder}
	 */
	handleEvent(evt) {
		evt.stopPropagation();
		switch (evt.type) {
			case 'pointermove': {
				if (this._movedShape) {
					const shapePosition = {
						x: this._movedDelta.x + evt.offsetX,
						y: this._movedDelta.y + evt.offsetY
					};

					this._positionSet(this._movedShape, shapePosition);

					if (this._movedConnectors && this._movedConnectors.size) {
						for (const svgPath of this._movedConnectors) {
							svgPath.setAttribute('d',
								this._connectorData.dataGet(svgPath)
									.updatePath({ shape: this._movedShape, position: shapePosition })
							);
						}
					}
				}

				// custom pointerenter, pointerleave
				this._pointedSet(evt);
				break;
			}
			case 'pointerdown': {
				if (evt.currentTarget === this._svg) {
					this._selectedSet(this._allGroup);
					this._movedSet(
						this._allGroup,
						{ x: evt.offsetX, y: evt.offsetY });
				} else if (evt.currentTarget.getAttribute('data-connect')) {
					//
					// connector create

					/** @type {SVGGElement} */
					const shape = evt.currentTarget.closest('[data-templ]');
					const connectorEndShape = this._connectorEndCreate(shape, evt.currentTarget);
					this._connectorAdd(
						{ shape: shape, connectorElem: evt.currentTarget },
						{ shape: connectorEndShape, connectorElem: connectorEndShape }
					);

					this._movedSet(connectorEndShape, { x: evt.offsetX, y: evt.offsetY }, true);
				} else if (evt.currentTarget.getAttribute('data-connect-connected')) {
					//
					// disconnect

					const connectorElem = this._elData.get(evt.currentTarget);
					/** @type {SVGGElement} */
					const shape = evt.currentTarget.parentElement.closest('[data-templ]');
					const connectedPaths = this._connectorData.relatedPathListByEndShare(shape, connectorElem);
					const connectorEndShape = this._connectorEndCreate(shape, connectorElem);

					this._connectorUpdateEnd(
						connectedPaths[connectedPaths.length - 1],
						{ shape: connectorEndShape, connectorElem: connectorEndShape });

					this._movedSet(connectorEndShape, { x: evt.offsetX, y: evt.offsetY }, true);

					if (connectedPaths.length === 1) {
						// can't delete here becouse of mobile
						// shape.removeChild(evt.currentTarget);
						evt.currentTarget.style.display = 'none';
						this._toDel = evt.currentTarget;
					}
				} else {
					//
					// move shape

					/** @type {SVGGElement} */
					const shape = evt.currentTarget.closest('[data-templ]');
					this._movedSet(
						shape,
						{ x: evt.offsetX, y: evt.offsetY },
						shape.getAttribute('data-templ') === 'connect-end');
				}
				break;
			}
			case 'pointerup': {
				if (this._movedShape) {
					// connect connector
					if (this._pointConnectorIn) {
						const shape = this._pointShape;
						const connectorData = this._connectorUpdateEnd(
							this._connectorData.relatedPathList(this._movedShape).values().next().value,
							{ shape: shape, connectorElem: this._pointConnectorIn });

						// add connectorEnd to shape
						if (this._connectorData.relatedPathListByEndShare(shape, this._pointConnectorIn).length === 1) {
							const connectorEndShape = /** @type{SVGGraphicsElement} */(this._movedShape.cloneNode(true));
							this._positionSet(connectorEndShape, connectorData.point2.innerPosition);
							this._rotate(connectorEndShape, connectorData.point2.dir);
							connectorEndShape.setAttribute('pointer-events', 'auto');
							connectorEndShape.setAttribute('data-connect-connected', 'true');
							connectorEndShape.addEventListener('pointerdown', this);
							this._elData.set(connectorEndShape, connectorData.point2.connectorElem);
							shape.appendChild(connectorEndShape);
						}

						this.shapeDel(this._movedShape);
					}

					this._movedClean();
					this._pointedClean();
					if (this._toDel) {
						this._toDel.parentElement.removeChild(this._toDel);
						this._toDel = null;
					}
				}
				break;
			}
			// case 'pointerenter': {
			//	if (this._movedShape?.getAttribute('data-templ') === 'connect-end') {
			//		evt.currentTarget.classList.add('hover');
			//	}
			//	break;
			// }
			// case 'pointerleave': {
			//	// clean moved
			//	if (evt.currentTarget === this._svg && this._movedShape) {
			//		this._movedClean();
			//	}
			//	else {
			//		evt.currentTarget.classList.remove('hover');
			//	}
			//	break;
			// }
		}
	}

	/**
	 * @param {SVGElement} shape
	 * @private
	 */
	_selectedSet(shape) {
		if (shape !== this._selectedShape) {
			this._svg.dispatchEvent(new CustomEvent('select', {
				cancelable: true,
				detail: { shape: shape }
			}));

			if (this._selectedShape) {
				this._selectedShape.classList.remove('selected');
			}

			if (shape) {
				shape.classList.add('selected');
			}

			this._selectedShape = shape;
		}
	}

	/**
	 * @param {SVGGraphicsElement} shape
	 * @param {Point} offsetPoint
	 * @param {Boolean=} shapeIsConnector
	 * @private
	 */
	_movedSet(shape, offsetPoint, shapeIsConnector = null) {
		this._movedShape = shape;
		this._movedConnectors = this._connectorData.relatedPathList(this._movedShape);

		const shapePosition = DiagramBuilder._positionGet(this._movedShape);
		this._movedDelta = {
			x: shapePosition.x - offsetPoint.x,
			y: shapePosition.y - offsetPoint.y
		};

		this._selectedSet(this._movedShape);

		this._movedShapeIsConnector = shapeIsConnector;
		if (shapeIsConnector) {
			this._movedShape.setAttribute('pointer-events', 'none');
		}
	}

	/** @private */
	_movedClean() {
		if (this._movedShape) {
			this._movedShape.setAttribute('pointer-events', 'auto');
		}
		/** @private */
		this._movedDelta = null;
		/** @private */
		this._movedConnectors = null;
		/** @private */
		this._movedShape = null;
		/** @private */
		this._movedShapeIsConnector = null;
	}

	/**
	 *  calc elements under pointer
	 *  @param {PointerEvent} evt
	 *  @private
	 */
	_pointedSet(evt) {
		if (!this._movedShapeIsConnector) {
			return;
		}

		const pointElem = document.elementFromPoint(evt.clientX, evt.clientY);
		if (pointElem === this._pointElem) {
			return;
		}
		this._pointElem = pointElem;

		const pointShape = pointElem ? pointElem.closest('[data-templ]') : null;
		if (this._pointShape !== pointShape) {
			if (this._pointShape) { this._pointShape.classList.remove('hover'); }

			this._pointShape = pointShape;
			if (pointShape) {
				pointShape.classList.add('hover');
			}
		}

		const pointConnectorIn = (pointElem && pointElem.getAttribute('data-connect') === 'in')
			? pointElem
			: null;
		if (this._pointConnectorIn !== pointConnectorIn) {
			if (this._pointConnectorIn) { this._pointConnectorIn.classList.remove('hover'); }

			this._pointConnectorIn = pointConnectorIn;
			if (pointConnectorIn) {
				pointConnectorIn.classList.add('hover');
			}
		}
	}

	/** @private */
	_pointedClean() {
		/** @type {HTMLOrSVGElement}
		 *  @private */
		this._pointElem = null;

		if (this._pointShape) {
			this._pointShape.classList.remove('hover');
			/** @type {SVGGElement}
			 *  @private */
			this._pointShape = null;
		}

		if (this._pointConnectorIn) {
			this._pointConnectorIn.classList.remove('hover');
			/** @type {SVGElement}
			 *  @private */
			this._pointConnectorIn = null;
		}
	}

	/**
	 * @param {SVGGElement} shape
	 * @param {SVGGraphicsElement} connectorElem
	 * @returns {SVGGraphicsElement}
	 */
	_connectorEndCreate(shape, connectorElem) {
		const shapePosition = DiagramBuilder._positionGet(shape);
		const innerPosition = DiagramBuilder._dataPointAttrParse(connectorElem);
		return this.shapeAdd({
			templateKey: 'connect-end',
			position: {
				x: shapePosition.x + innerPosition.x,
				y: shapePosition.y + innerPosition.y
			},
			isInner: true
		});
	}

	/**
	 * @param {SVGPathElement} path
	 * @param {ShapeConnectPoint} shapePoint2
	 * @returns {ConnectorData}
	 */
	_connectorUpdateEnd(path, shapePoint2) {
		const connectorData = this._connectorData.dataGet(path);
		this._connectorDel(path);
		return this._connectorAdd(
			{ shape: connectorData.point1.shapePosition.shape, connectorElem: connectorData.point1.connectorElem },
			shapePoint2
		);
	}

	/**
	 * @param {ShapeConnectPoint} shapePoint1
	 * @param {ShapeConnectPoint} shapePoint2
	 * @returns {ConnectorData}
	 * @private
	 */
	_connectorAdd(shapePoint1, shapePoint2) {
		/** @type {SVGPathElement} */
		const path = this._tempClone('path');

		const point1 = this._connectorPointCreate(shapePoint1);
		const point2 = this._connectorPointCreate(shapePoint2);

		// if connectorEndShape
		if (!point2.dir) {
			point2.dir = point1.dir === 'left'
				? 'right'
				: point1.dir === 'right'
					? 'left'
					: point1.dir === 'top' ? 'bottom' : 'top';

			this._rotate(shapePoint2.shape, point2.dir);
		}

		const connectorData = new ConnectorData(point1, point2);
		this._connectorData.dataSet(path, connectorData);

		// draw path

		path.setAttribute('d', connectorData.path());
		this._allGroup.appendChild(path);

		return connectorData;
	}

	/**
	* @param {ShapeConnectPoint} shapePoint
	* @returns {import('./connector-data').ConnectorPoint}
	* @private
	*/
	_connectorPointCreate(shapePoint) {
		return {
			shapePosition: { shape: shapePoint.shape, position: DiagramBuilder._positionGet(shapePoint.shape) },
			innerPosition: DiagramBuilder._dataPointAttrParse(shapePoint.connectorElem),
			connectorElem: shapePoint.connectorElem,
			dir: /** @type {PresenterPathEndDirection} */(shapePoint.connectorElem.getAttribute('data-connect-dir'))
		};
	}

	/**
	 * @param {SVGPathElement} path
	 * @private
	 */
	_connectorDel(path) {
		this._connectorData.dataDel(path);
		this._allGroup.removeChild(path);
	}

	/**
	 * @param {SVGElement} el
	 * @returns {Point}
	 * @private
	 */
	static _dataPointAttrParse(el) {
		const point = el.getAttribute('data-connect-point').split(',');
		return { x: parseFloat(point[0]), y: parseFloat(point[1]) };
	}

	dispose() {
		this._svg.removeEventListener('pointermove', this);
		this._svg.removeEventListener('pointerup', this);
		this._svg.removeEventListener('pointerdown', this);
		// this._svg.removeEventListener('pointerleave', this);
		this._allGroup.querySelectorAll('[data-drag], [data-connect], [data-templ]')
			.forEach(el => {
				el.removeEventListener('pointerdown', this);
				el.removeEventListener('pointerup', this);
				// el.removeEventListener('pointerenter', this);
			});
		this._movedClean();
	}
}
