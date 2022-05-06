import { SvgShapeEditableAbstractDecorator } from './svg-shape-editable-abstract-decorator.js';
import { textEditorHighlightEmpty, textEditorShow } from './text-editor-utils.js';

/** @implements {ISvgPresenterShape} */
export class SvgShapeTextEditorDecorator extends SvgShapeEditableAbstractDecorator {
	/**
	 * @param {ISvgPresenterShape} svgShape
	 * @param {PresenterShapeProps} initProps
	 */
	constructor(svgShape, initProps) {
		super(svgShape);

		/**
		 * @type {PresenterShapeProps}
		 * @private
		 */
		this._props = Object.assign({}, initProps);
	}

	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @returns {SvgShapeTextEditorDecorator}
	 */
	on(type, listener) {
		this.svgEl.addEventListener(type, listener);
		return this;
	}

	/**
	 * @param {PresenterShapeUpdateParam} param
	 */
	update(param) {
		super.update(param);

		if (param.props) {
			this._props = Object.assign({}, param.props);
		}

		if (param.state && param.state.has('selected') && !this.stateGet().has('selected')) {
			textEditorHighlightEmpty(this.svgEl, this._props);
		}
	}

	/**
	 * when shape enter edit mode
	 * override this method
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	onEdit(evt) {
		this._textEditorShow(evt);
		this._panelShow();
	}

	/**
	  * when shape leave edit mode
	  * override this method
	  */
	onEditLeave() {
		this._textEditorDel();
		this._panelDel();
	}

	/**
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 * @private
	 */
	_textEditorShow(evt) {
		if (this._textEditor) { return; }

		this._textEditor = textEditorShow(this.svgEl, this._props, evt.target,
			// onchange
			textEl => {
				this._onTextChange(textEl);
			},
			// onblur
			_ => { this._textEditorDel(); }
		);
	}

	/**
	 * @param {SVGTextElement} textEl
	 */
	_onTextChange(textEl) {
		this.svgEl.dispatchEvent(new CustomEvent('update', {
			/** @type {ShapeTextEditorDecoratorEventUpdateDetail} */
			detail: {
				target: this,
				props: this._props
			}
		}));
	}

	/** @private */
	_textEditorDel() {
		if (!this._textEditor) { return; }

		const textEditor = this._textEditor;
		this._textEditor = null;
		textEditor.remove();
	}

	/** @private */
	_panelShow() {
		if (this._panel) { return; }

		const position = this.svgEl.getBoundingClientRect();

		const panelDiv = document.createElement('div');
		panelDiv.classList.add('pop-set');
		panelDiv.style.position = 'fixed';
		panelDiv.style.top = `${position.top - 35}px`;
		panelDiv.style.left = `${position.left + 10}px`;
		panelDiv.innerHTML = `
			<style>
			.pop-set {
				position: fixed;
				padding: 10px;
				box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%);
				border-radius: 16px;
				background-color: rgba(255,255,255, .9);
			}
			</style>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>`;
		panelDiv.onclick = _ => {
			this._panelDel();
			this.svgEl.dispatchEvent(new CustomEvent('del', {
				/** @type {ShapeTextEditorDecoratorEventUpdateDetail} */
				detail: {
					target: this
				}
			}));
		};
		document.body.append(panelDiv);

		/** @private */
		this._panel = panelDiv;
	}

	/** @private */
	_panelDel() {
		if (!this._panel) { return; }

		const panelDiv = this._panel;
		this._panel = null;
		panelDiv.remove();
	}
}
