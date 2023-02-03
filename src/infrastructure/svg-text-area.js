import { svgTextDraw } from './svg-text-draw.js';
import { svgEl } from './util.js';

/**
 * Create teaxtArea above SVGTextElement 'textEl'
 * update 'textEl' with text from teaxtArea
 * resize teaxtArea - so teaxtArea always cover all 'textEl'
 * @param {SVGTextElement} textEl
 * @param {number} verticalMiddle em
 * @param {string} val
 * @param {{(val:string):void}} onchange
 * @param {{(val:string):void}} onblur
 */
export function textareaCreate(textEl, verticalMiddle, val, onchange, onblur) {
	let foreign = svgEl('foreignObject');
	const textarea = document.createElement('textarea');
	const draw = () => foreignWidthSet(textEl, foreign, textarea, textareaPaddingAndBorder, textareaStyle.textAlign);

	textarea.value = val || '';
	textarea.oninput = function() {
		svgTextDraw(textEl, verticalMiddle, textarea.value);
		onchange(textarea.value);
		draw();
	};
	textarea.onblur = function() {
		onblur(textarea.value);
	};
	textarea.onpointerdown = function(evt) {
		evt.stopImmediatePropagation();
	};

	foreign.appendChild(textarea);
	textEl.parentElement.appendChild(foreign);

	const textareaStyle = getComputedStyle(textarea);
	// must be in px
	const textareaPaddingAndBorder = parseInt(textareaStyle.paddingLeft) + parseInt(textareaStyle.borderWidth);
	draw();

	textarea.focus();

	return {
		dispose: () => { foreign.remove(); foreign = null; },
		draw
	};
}

/**
 * @param {SVGTextElement} textEl
 * @param {SVGForeignObjectElement} foreign
 * @param {HTMLTextAreaElement} textarea
 * @param {number} textareaPaddingAndBorder
 * @param {string} textAlign
 */
function foreignWidthSet(textEl, foreign, textarea, textareaPaddingAndBorder, textAlign) {
	const textBbox = textEl.getBBox();
	const width = textBbox.width + 20; // +20 paddings for iPhone

	foreign.width.baseVal.value = width + 2 * textareaPaddingAndBorder + 2; // +2 magic number for FireFox
	foreign.x.baseVal.value = textBbox.x - textareaPaddingAndBorder - (
		textAlign === 'center'
			? 10
			: textAlign === 'right' ? 20 : 0);

	foreign.height.baseVal.value = textBbox.height + 2 * textareaPaddingAndBorder + 3; // +3 magic number for FireFox
	foreign.y.baseVal.value = textBbox.y - textareaPaddingAndBorder;

	textarea.style.width = `${width}px`;
	textarea.style.height = `${textBbox.height}px`;
}
