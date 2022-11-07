import { SvgShapeEditableAbstractDecorator } from './svg-shape-editable-abstract-decorator.js';
import { /* textEditorHighlightEmpty, */ textEditorShow } from './text-editor-utils.js';

export class SvgShapeTextEditorDecorator extends SvgShapeEditableAbstractDecorator {
	/**
	 * @param {ISvgPresenterShape} svgShape
	 * @param {DiagramShapeProps} txtProps
	 * Describes text-editors.
	 * Example: { text: { textContent: 'Title' } }
	 * <text data-key="text" ...> will get texteditor functionality and filled with 'Title'
	 * See textEditorShow function
	 */
	constructor(svgShape, txtProps) {
		super(svgShape);

		/** @type {DiagramShapeProps} */
		this.txtProps = Object.assign({}, txtProps); // TODO: save only 'textContent' props
	}

	/**
	 * @param {DiagramShapeUpdateParam} param
	 */
	update(param) {
		if (param.props) {
			Object.assign(this.txtProps, param.props); // TODO: save only 'textContent' props
		}

		// currnelty don't used
		// if (param.state && param.state.has('selected') && !this.stateGet().has('selected')) {
		// 	textEditorHighlightEmpty(this.svgEl, this.txtProps);
		// }

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
		this._textEditor = textEditorShow(this.svgEl, this.txtProps, evt.target,
			// onchange
			(textEl, updatedProp) => {
				Object.assign(this.txtProps, updatedProp);
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
	onTextChange(textEl, updatedProp) {	}

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
