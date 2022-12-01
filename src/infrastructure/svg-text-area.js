import { svgTextDraw } from './svg-text-draw.js';

/**
 * Create teaxtArea above SVGTextElement 'textEl'
 * update 'textEl' with text from teaxtArea
 * resize teaxtArea - so teaxtArea always cover all 'textEl'
 * @param {SVGTextElement} textEl
 * @param {number} verticalMiddle
 * @param {string} val
 * @param {{(val:string):void}} onchange
 * @param {{(val:string):void}} onblur
 * @returns {SVGForeignObjectElement}
 */
export function textareaCreate(textEl, verticalMiddle, val, onchange, onblur) {
	const foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');

	const textarea = document.createElement('textarea');
	textarea.style.caretColor = textEl.getAttribute('fill');
	textarea.value = val;
	textarea.oninput = function() {
		svgTextDraw(textEl, textarea.value, verticalMiddle);
		foreignWidthSet(textEl, foreign, textarea, textareaPaddingAndBorder, textareaStyle.textAlign);
		onchange(textarea.value);
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
	const textareaPaddingAndBorder = 10;// parseInt(textareaStyle.padding) + parseInt(textareaStyle.borderWidth);
	foreignWidthSet(textEl, foreign, textarea, textareaPaddingAndBorder, textareaStyle.textAlign);

	textarea.focus();
	return foreign;
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
	foreign.x.baseVal.value = textBbox.x - textareaPaddingAndBorder - ((textAlign === 'center') ? 10 : 0);

	foreign.height.baseVal.value = textBbox.height + 2 * textareaPaddingAndBorder + 3; // +3 magic number for FireFox
	// console.log(textEl.y.baseVal, textBbox.y);
	foreign.y.baseVal.value = textBbox.y - textareaPaddingAndBorder;

	textarea.style.width = `${width}px`;
	textarea.style.height = `${textBbox.height}px`;
}
