import { any } from '../../../diagram/infrastructure/iterable-utils.js';
import { AppShapeEditorDecorator } from '../shapes/app-editor-decorator.js';
import { AppDiagramPngMixin } from './app-diagram-png-mixin.js';

/**
 * @implements {IAppDiagramSerializable}
 * @mixes AppDiagramPngMixin
 */
export class AppDiagramSerializable extends EventTarget {
	/**
	 * @param {SVGSVGElement} svg
	 * @param {IDiagram} diagram
	 */
	constructor(svg, diagram) {
		super();

		this.svg = svg;

		/**
		 * @type {Map<IDiagramShape, {templateKey:string, detail:string}>}}
		 * @private
		 */
		this._shapeData = new Map();

		/** @private */
		this._diagram = diagram
			.on('add', this)
			.on('del', this);
	}

	/**
	 * @param {CustomEvent<ShapeTextEditorDecoratorEventUpdateDetail> | CustomEvent<IDiagramEventDetail<IDiagramElement>>} evt
	 */
	handleEvent(evt) {
		switch (evt.type) {
			case 'add':
				if (evt.detail.target instanceof AppShapeEditorDecorator) {
					/** @type {IAppShapeEditorDecorator} */(evt.detail.target).on('txtUpd', this);
				}
				break;
			case 'txtUpd':
				this._shapeData.get(/** @type {CustomEvent<ShapeTextEditorDecoratorEventUpdateDetail>} */(evt).detail.target).detail =
					/** @type {string} */ (/** @type {CustomEvent<ShapeTextEditorDecoratorEventUpdateDetail>} */(evt).detail.props.text.textContent);
				break;
			case 'del':
				this._shapeData.delete(/** @type {IDiagramShape} */(evt.detail.target));
				break;
		}
	}

	/**
	 * @param {DiagramShapeAddParam} param
	 * @returns {IDiagramShape}
	 */
	shapeAdd(param) {
		const shape = /** @type {IDiagramShape} */(this._diagram.add('shape', param));

		this._shapeData.set(
			shape,
			{
				templateKey: param.templateKey,
				detail: /** @type {string} */(param.props.text?.textContent)
			});

		this.dispatchEvent(new CustomEvent('shapeAdd', {
			cancelable: true,
			detail: shape
		}));

		return shape;
	}

	/**
	 * @param {IDiagramShape} shape
	 * @param {DiagramShapeUpdateParam} param
	 * @returns {void}
	 */
	shapeUpdate(shape, param) { this._diagram.shapeUpdate(shape, param); }

	/**
	 * @param {IDiagramElement} elem
	 */
	// eslint-disable-next-line accessor-pairs
	set activeElement(elem) {
		this._diagram.activeElement = elem;
	}

	/** @returns {void} */
	clear() {
		for (const shapeData of this._shapeData) {
			this._diagram.del(shapeData[0]);
		}
	}

	/** @returns {AppSerializeData} */
	dataGet() {
		if (!any(this._shapeData)) {
			return null;
		}

		/** @type {AppSerializeData} */
		const serializeData = {
			s: [],
			c: []
		};

		/** @type {Map<IDiagramShape, number>} */
		const shapeIndex = new Map();

		for (const shape of this._shapeData) {
			const position = shape[0].positionGet();
			position.x = Math.trunc(position.x);
			position.y = Math.trunc(position.y);

			/** @type {AppSerializeShape} */(shape[1]).position = position;
			shapeIndex.set(shape[0], serializeData.s.push(/** @type {AppSerializeShape} */(shape[1])) - 1);
		}

		/** @type {Set<IDiagramPath>} */
		const pathsAdded = new Set();
		for (const shape of this._shapeData) {
			if (any(shape[0].connectedPaths)) {
				for (const path of shape[0].connectedPaths) {
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
			const shape = this.shapeAdd({
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
	 * @param {AppDiagramEventType} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(evtType, listener) {
		this.addEventListener(evtType, listener);
		return this;
	}
}

//
// Mixin

Object.assign(AppDiagramSerializable.prototype, AppDiagramPngMixin);
