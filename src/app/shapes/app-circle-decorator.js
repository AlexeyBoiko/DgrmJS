import { svgTextIsOut } from '../../diagram-extensions/infrastructure/svg-text-is-out.js';
import { SvgShapeTextEditorDecorator } from '../../diagram-extensions/svg-shape-texteditor-decorator.js';

export class AppCircleDecorator extends SvgShapeTextEditorDecorator {
	/**
	 * @param {SVGTextElement} textEl
	 */
	onTextChange(textEl) {
		if (!this._circle) {
			/**
			 * @type {SVGCircleElement}
			 * @private
			 */
			this._circle = this.svgEl.querySelector('[data-key="main"]');
		}

		if (svgTextIsOut(textEl, this._circle, 5)) {
			this._circle.r.baseVal.value = this._circle.r.baseVal.value * 1.25;
		}

		super.onTextChange(textEl);
	}
}
