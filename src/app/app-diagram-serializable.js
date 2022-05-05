import { svgDiagramCreate } from '../diagram/svg-presenter/svg-diagram-factory.js';
import { SvgShapeTextEditorDecorator } from '../diagram-extensions/svg-shape-texteditor-decorator.js';
import { AppDiagramPngMixin } from './app-diagram-png-mixin.js';

/**
 * @implements {IAppDiagramSerializable}
 * @mixes AppDiagramPngMixin
 */
export class AppDiagramSerializable extends EventTarget {
	/**
	 * @param {SVGSVGElement} svg
	 */
	constructor(svg) {
		super();

		this.svg = svg;

		/**
		 * @type {Map<IDiagramShape, {templateKey:string, detail:string}>}}
		 * @private
		 */
		this._shapeData = new Map();

		/**
		 * @type {IDiagramEventConnectDetail[]}
		 * @private
		 */
		this._connectors = [];

		/** @private */
		this._diagram = svgDiagramCreate(
			svg,
			(shape, param) => {
				// the way to add custom logic inside shapes - decorators
				return new SvgShapeTextEditorDecorator(shape, param.createParams.props);
			})
			.on('connect', this)
			.on('disconnect', this);
	}

	/**
	 * @param {CustomEvent<ISvgPresenterShapeEventUpdateDetail> & CustomEvent<IDiagramEventConnectDetail>} evt
	 */
	handleEvent(evt) {
		switch (evt.type) {
			case 'update':
				this._shapeData.get(evt.detail.target).detail =
					/** @type {string} */ (evt.detail.props.text.textContent);
				break;
			case 'del':
				this._shapeDel(evt.detail.target);
				break;
			case 'connect':
				this._connectors.push(evt.detail);
				break;
			case 'disconnect':
				this._connectors.splice(this._connectors.findIndex(el => connectorEqual(el, evt.detail)), 1);
				break;
		}
	}

	/**
	 * @param {IDiagramShape} shape
	 * @private
	 */
	_shapeDel(shape) {
		this._diagram.shapeDel(shape);
		this._shapeData.delete(shape);
		this._connectors = this._connectors
			.filter(el => el.start.shape !== shape && el.end.shape !== shape);
	}

	/**
	 * @param {PresenterShapeAppendParam} param
	 * @returns {IDiagramShape}
	 */
	shapeAdd(param) {
		const shape = this._diagram.shapeAdd(param);
		this._shapeData.set(
			shape,
			{
				templateKey: param.templateKey,
				detail: /** @type {string} */(param.props.text?.textContent)
			});

		/** @type {SvgShapeTextEditorDecorator} */
		(shape)
			.on('update', this)
			.on('del', this);

		this.dispatchEvent(new CustomEvent('shapeAdd', {
			cancelable: true,
			detail: shape
		}));

		return shape;
	}

	/**
	 * @param {IDiagramShape} shape
	 * @param {PresenterShapeUpdateParam} param
	 * @returns {void}
	 */
	shapeUpdate(shape, param) { this._diagram.shapeUpdate(shape, param); }

	/**
	 * @param {IDiagramShape} shape
	 * @param {Point} offsetPoint
	 * @returns {void}
	 */
	shapeSetMoving(shape, offsetPoint) { this._diagram.shapeSetMoving(shape, offsetPoint); }

	/** @returns {void} */
	clear() {
		for (const shapeData of this._shapeData) {
			this._shapeDel(shapeData[0]);
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

		if (this._connectors && this._connectors.length > 0) {
			serializeData.c = this._connectors.map(cc => ({
				s: { i: shapeIndex.get(cc.start.shape), c: cc.start.key },
				e: { i: shapeIndex.get(cc.end.shape), c: cc.end.key }
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
				const path = this._diagram.shapeConnect({
					start: { shape: shapes[conJson.s.i], connector: conJson.s.c },
					end: { shape: shapes[conJson.e.i], connector: conJson.e.c }
				});

				this._connectors.push({
					start: { type: 'connector', key: conJson.s.c, shape: shapes[conJson.s.i] },
					end: { type: 'connector', key: conJson.e.c, shape: shapes[conJson.e.i] }
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

/**
 * @param {IDiagramEventConnectDetail} con1
 * @param {IDiagramEventConnectDetail} con2
 * @returns {boolean}
 */
function connectorEqual(con1, con2) {
	return con1.start.shape === con2.start.shape && con1.start.key === con2.start.key &&
	con1.end.shape === con2.end.shape && con1.end.key === con2.end.key;
}

//
// Mixin

Object.assign(AppDiagramSerializable.prototype, AppDiagramPngMixin);
