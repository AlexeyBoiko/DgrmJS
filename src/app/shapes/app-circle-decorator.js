import { svgTextIsOut } from '../../diagram-extensions/infrastructure/svg-text-is-out.js';
import { SvgShapeTextEditorDecorator } from '../../diagram-extensions/svg-shape-texteditor-decorator.js';

export class AppCircleDecorator extends SvgShapeTextEditorDecorator {
	/**
	 * @param {SVGTextElement} textEl
	 */
	onTextChange(textEl) {
		super.onTextChange(textEl);

		if (!this._circle) {
			/** @private */
			this._circle = /** @type {SVGCircleElement}} */ (this.svgEl.querySelector('[data-key="main"]'));

			/** @private */
			this._minR = this._circle.r.baseVal.value;

			this._copy = /** @type {SVGCircleElement}} */ (this._circle.cloneNode(false));
			this._copy.style.fill = 'transparent';
			this._copy.style.stroke = 'transparent';
			this.svgEl.appendChild(this._copy);
		}

		if (this._isOut(textEl)) {
			do { this._copy.r.baseVal.value = this._copy.r.baseVal.value + 20; }
			while (this._isOut(textEl));

			this._circle.r.baseVal.value = this._copy.r.baseVal.value;
		} else {
			if (this._minR === this._circle.r.baseVal.value) { return; }

			do { this._copy.r.baseVal.value = this._copy.r.baseVal.value - 20; }
			while (!this._isOut(textEl));

			this._copy.r.baseVal.value = this._copy.r.baseVal.value + 20;
			if (this._circle.r.baseVal.value !== this._copy.r.baseVal.value) {
				this._circle.r.baseVal.value = this._copy.r.baseVal.value;
			}
		}
	}

	/**
	 * @param {SVGTextElement} textEl
	 * @returns {boolean}
	 * @private
	 */
	_isOut(textEl) {
		return svgTextIsOut(textEl, this._copy, 5);
	}
}
