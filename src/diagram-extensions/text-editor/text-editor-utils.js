import { textParamsParse } from '../../diagram/svg-presenter/svg-shape/svg-shape.js';
import { textareaCreate } from '../infrastructure/svg-textarea.js';

// utils encapsulate work with texteditor attributes and class names

/**
 * show text editor if 'targetEl' is marked for text editor
 * set 'props' with text from texteditor
 *
 * function encapsulate parsing text editor attributes
 *
 * Markup example:
 * <rect data-text-for="text" ... />
 * <text data-key="text" data-line-height="20" data-vertical-middle="35" text-anchor="middle"
 * 	alignment-baseline="central" ...>&nbsp;</text>
 *
 * @param {SVGGraphicsElement} svgShapeEl
 * @param {DiagramShapeProps} props
 * @param {SVGGraphicsElement} targetEl
 * @param {{(textEl:SVGTextElement, updatedProp:DiagramShapeProps):void}} onchange
 * @param {{():void}} onblur
 * @returns {SVGForeignObjectElement}
 */
export function textEditorShow(svgShapeEl, props, targetEl, onchange, onblur) {
	/** @type {SVGRectElement} */
	let placeEl;
	switch (targetEl.tagName) {
		case 'tspan':
			placeEl = svgShapeEl.querySelector(`[data-text-for=${targetEl.parentElement.getAttribute('data-key')}]`);
			break;
		case 'text':
			placeEl = svgShapeEl.querySelector(`[data-text-for=${targetEl.getAttribute('data-key')}]`);
			break;
		default:
			if (targetEl.getAttribute('data-text-for')) {
				placeEl = /** @type {SVGRectElement} */(targetEl);
			}
			break;
	}

	if (!placeEl) { return; }

	placeEl.classList.remove('empty');
	const textKey = placeEl.getAttribute('data-text-for');

	/** @type {SVGTextElement} */
	const textEl = svgShapeEl.querySelector(`[data-key=${textKey}]`);

	return textareaCreate(
		// textEl
		textEl,
		// textParam
		textParamsParse(textEl),
		// val
		props[textKey]?.textContent.toString(),
		// onchange
		val => {
			onchange(textEl, { [textKey]: { textContent: val } });
		},
		// onblur
		val => {
			if (!val) { placeEl.classList.add('empty'); } else { placeEl.classList.remove('empty'); }
			onblur();
		});
}

/**
 * @param {SVGGraphicsElement} svgShapeEl
 * @param {DiagramShapeProps} props
 */
export function textEditorHighlightEmpty(svgShapeEl, props) {
	svgShapeEl.querySelectorAll('[data-text-for]').forEach(el => {
		if (!props[el.getAttribute('data-text-for')]?.textContent) {
			el.classList.add('empty');
		}
	});
}
