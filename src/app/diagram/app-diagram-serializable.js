import { map } from '../../diagram/infrastructure/iterable-utils.js';
import { setFilter } from '../infrastructure/iterable-utils.js';
import { AppPathEditiorDecorator, AppShapeEditorDecorator } from '../shapes/app-editor-decorator.js';
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

		/**
		 * @type {Set<IDiagramPath>}
		 * @private
		 */
		this._paths = new Set();

		/** @private */
		this._diagram = diagram
			.on('connect', this)
			.on('disconnect', this)
			.on('add', this);
	}

	/**
	 * @param {CustomEvent<ShapeTextEditorDecoratorEventUpdateDetail> | CustomEvent<IDiagramEventDetail<IDiagramElement>>} evt
	 */
	handleEvent(evt) {
		switch (evt.type) {
			case 'add':
				if (evt.detail.target instanceof AppShapeEditorDecorator) {
					/** @type {IAppShapeEditorDecorator} */(evt.detail.target)
						.on('txtUpd', this)
						.on('del', this);
				} else if (evt.detail.target instanceof AppPathEditiorDecorator) {
					/** @type {IAppPathEditorDecorator} */(evt.detail.target)
						.on('del', this);
				}
				break;
			case 'txtUpd':
				this._shapeData.get(/** @type {CustomEvent<ShapeTextEditorDecoratorEventUpdateDetail>} */(evt).detail.target).detail =
					/** @type {string} */ (/** @type {CustomEvent<ShapeTextEditorDecoratorEventUpdateDetail>} */(evt).detail.props.text.textContent);
				break;
			case 'del':
				this._elementDel(/** @type {CustomEvent<IDiagramEventDetail<IDiagramElement>>} */(evt).detail.target);
				break;
			case 'connect':
				this._paths.add(/** @type {CustomEvent<IDiagramEventDetail<IDiagramPath>>} */(evt).detail.target);
				break;
			case 'disconnect':
				this._paths.delete(/** @type {CustomEvent<IDiagramEventDetail<IDiagramPath>>} */(evt).detail.target);
				break;
		}
	}

	/**
	 * @param {IDiagramElement} element
	 * @private
	 */
	_elementDel(element) {
		this._diagram.del(element);
		switch (element.type) {
			case 'shape':
				this._shapeData.delete(/** @type {IDiagramShape} */(element));
				setFilter(this._paths, el => el.start.shape !== element && el.end.shape !== element);
				break;
			case 'path':
				this._paths.delete(/** @type {IDiagramPath} */(element));
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
	 * @param {IDiagramShape} shape
	 * @param {Point} offsetPoint
	 * @returns {void}
	 */
	shapeSetMoving(shape, offsetPoint) { this._diagram.shapeSetMoving(shape, offsetPoint); }

	movedClean() { this._diagram.movedClean(); }

	/** @returns {void} */
	clear() {
		for (const shapeData of this._shapeData) {
			this._elementDel(shapeData[0]);
		}
	}

	/** @returns {AppSerializeData} */
	dataGet() {
		if (!this._shapeData || this._shapeData.size === 0) {
			return null;
		}

		/** @type {AppSerializeData} */
		const serializeData = {
			s: []
		};

		/** @type {Map<IDiagramShape, number>} */
		const shapeIndex = new Map();

		for (const shape of this._shapeData) {
			/** @type {AppSerializeShape} */(shape[1]).position = shape[0].positionGet();
			shapeIndex.set(shape[0], serializeData.s.push(/** @type {AppSerializeShape} */(shape[1])) - 1);
		}

		if (this._paths && this._paths.size > 0) {
			serializeData.c = map(this._paths, path => ({
				s: { i: shapeIndex.get(path.start.shape), c: path.start.key },
				e: { i: shapeIndex.get(path.end.shape), c: path.end.key }
			}));
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
				this._paths.add(/** @type {IDiagramPath} */(this._diagram.add('path', {
					start: { shape: shapes[conJson.s.i], key: conJson.s.c },
					end: { shape: shapes[conJson.e.i], key: conJson.e.c }
				})));
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
