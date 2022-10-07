import { parseCenterAttr } from '../../../diagram-extensions/svg-utils.js';
import { any } from '../../../diagram/infrastructure/iterable-utils.js';
import { templateGet } from '../../../diagram/svg-presenter/svg-presenter-utils.js';
import { pointViewToCanvas } from '../../../diagram/utils/point-convert-utils.js';
import { AppDiagramPngMixin } from './app-diagram-png-mixin.js';

/**
 * @implements {IAppDiagramSerializable}
 * @mixes AppDiagramPngMixin
 */
export class AppDiagramSerializable {
	/**
	 * @param {SVGSVGElement} svg
	 * @param {IDiagram} diagram
	 */
	constructor(svg, diagram) {
		this.svg = svg;

		/**
		 * @type {Set<IAppShape>}
		 * @private
		 */
		this._shapes = new Set();

		/** @private */
		this._diagram = diagram
			.on('del',
				/** @param {CustomEvent<IDiagramEventDetail<IDiagramElement>>} evt */
				evt => this._shapes.delete(/** @type {IAppShape} */(evt.detail.target)));
	}

	/**
	 * Add shape and make it active (bind to pointer)
	 * @param {DiagramShapeAddParam} param
	 */
	shapeActiveAdd(param) {
		// calc shape position
		const pointInCanvas = pointViewToCanvas(
			// canvasPosition
			this._diagram.canvasPosition,
			// canvasScale
			this._diagram.scale,
			// point
			param.position);
		const addingShapeCenter = parseCenterAttr(templateGet(this.svg, param.templateKey));
		param.position.x = pointInCanvas.x - addingShapeCenter.x;
		param.position.y = pointInCanvas.y - addingShapeCenter.y;

		this._diagram.activeElement(this._shapeAdd(param));
	}

	/**
	 * @private
	 * @param {DiagramShapeAddParam} param
	 * @returns {IDiagramShape}
	 */
	_shapeAdd(param) {
		const shape = /** @type {IAppShape} */(this._diagram.add('shape', param));
		this._shapes.add(shape);
		return shape;
	}

	/** @returns {void} */
	clear() {
		for (const shape of this._shapes) {
			this._diagram.del(shape);
		}
		this._diagram.canvasPosition = { x: 0, y: 0 };
		this._diagram.scaleSet(1, { x: 0, y: 0 });
	}

	/** @returns {AppSerializeData} */
	dataGet() {
		if (!any(this._shapes)) {
			return null;
		}

		/** @type {AppSerializeData} */
		const serializeData = {
			s: [],
			c: []
		};

		/** @type {Map<IDiagramShape, number>} */
		const shapeIndex = new Map();

		for (const shape of this._shapes) {
			shapeIndex.set(shape, serializeData.s.push(shape.toJson()) - 1);
		}

		/** @type {Set<IDiagramPath>} */
		const pathsAdded = new Set();
		for (const shape of this._shapes) {
			if (any(shape.connectedPaths)) {
				for (const path of shape.connectedPaths) {
					if (!pathsAdded.has(path) && path.end.key) {
						pathsAdded.add(path);

						serializeData.c.push({
							s: { i: shapeIndex.get(path.start.shape), c: path.start.key },
							e: { i: shapeIndex.get(path.end.shape), c: path.end.key }
						});
					}
				}
			}
		}

		if (pathsAdded.size === 0) {
			delete serializeData.c;
		}

		return serializeData;
	}

	/**
	 * @param {AppSerializeData} data
	 * @returns {void}
	 */
	dataSet(data) {
		this.clear();
		if (!(data.s && data.s.length > 0)) { return; }

		/** @type {IDiagramShape[]} */
		const shapes = [];

		for (const shapeJson of data.s) {
			const shape = this._shapeAdd({
				templateKey: shapeJson.templateKey,
				position: shapeJson.position,
				props: {
					text: { textContent: shapeJson.detail }
				}
			});
			shapes.push(shape);
		}

		if (data.c && data.c.length > 0) {
			for (const conJson of data.c) {
				this._diagram.add('path', {
					start: { shape: shapes[conJson.s.i], key: conJson.s.c },
					end: { shape: shapes[conJson.e.i], key: conJson.e.c }
				});
			}
		}
	}

	/**
	 * subscribe to event
	 * @param {DiagramEventType} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {AddEventListenerOptions?=} options
	 */
	on(evtType, listener, options) {
		this._diagram.on(evtType, listener, options);
		return this;
	}
}

//
// Mixin

Object.assign(AppDiagramSerializable.prototype, AppDiagramPngMixin);
