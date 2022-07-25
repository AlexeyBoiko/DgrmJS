import { SvgShapeEditableAbstractDecorator } from './svg-shape-editable-abstract-decorator.js';
import { textEditorHighlightEmpty, textEditorShow } from './text-editor-utils.js';

/** @implements {IShapeTextEditorDecorator} */
export class SvgShapeTextEditorDecorator extends SvgShapeEditableAbstractDecorator {
	/**
	 * @param {ISvgPresenterShape} svgShape
	 * @param {DiagramShapeProps} initProps
	 */
	constructor(svgShape, initProps) {
		super(svgShape);

		/**
		 * @type {DiagramShapeProps}
		 * @private
		 */
		this._props = Object.assign({}, initProps); // TODO: save only 'textContent' props
	}

	/**
	 * @param {ShapeTextEditorEventType} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @returns {SvgShapeTextEditorDecorator}
	 */
	on(type, listener) {
		if (!this._listeners) {
			/**
			 * @type {{t:AppPathEditorEventType, l:EventListenerOrEventListenerObject }[]}
			 * @private
			 */
			this._listeners = [];
		}
		this._listeners.push({ t: type, l: listener });
		this.svgEl.addEventListener(type, listener);
		return this;
	}

	dispose() {
		this._listeners?.forEach(ll => this.svgElement.svgEl.removeEventListener(ll.t, ll.l));
		super.dispose();
	}

	/**
	 * @param {DiagramShapeUpdateParam} param
	 */
	update(param) {
		if (param.props) {
			Object.assign(this._props, param.props); // TODO: save only 'textContent' props
		}

		if (param.state && param.state.has('selected') && !this.stateGet().has('selected')) {
			textEditorHighlightEmpty(this.svgEl, this._props);
		}

		super.update(param);
	}

	/**
	 * click on shape
	 * override this method
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 * @param {boolean} isEditState
	 */
	onClick(evt, isEditState) {
		if (isEditState) { this._textEditorShow(evt); }
	}

	/**
	 * when shape leave edit mode
	 * override this method
	 */
	onEditLeave() {
		this._textEditorDel();
	}

	/**
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 * @private
	 */
	_textEditorShow(evt) {
		if (this._textEditor) { return; }

		/** @private */
		this._textEditor = textEditorShow(this.svgEl, this._props, evt.target,
			// onchange
			(textEl, updatedProp) => {
				Object.assign(this._props, updatedProp);
				this.onTextChange(textEl, updatedProp);
			},
			// onblur
			_ => { this._textEditorDel(); }
		);
	}

	/**
	 * when text changed
	 * can be overridden
	 * @param {SVGTextElement} textEl
	 * @param {DiagramShapeProps} updatedProp
	 */
	onTextChange(textEl, updatedProp) {
		this.svgEl.dispatchEvent(new CustomEvent('txtUpd', {
			/** @type {ShapeTextEditorDecoratorEventUpdateDetail} */
			detail: {
				target: this,
				props: updatedProp
			}
		}));
	}

	/** @private */
	_textEditorDel() {
		if (this._textEditor && !this._lock) {
			/** @private */
			this._lock = true;

			this._textEditor.remove();
			this._textEditor = null;
			this._lock = false;
		}
	}
}
