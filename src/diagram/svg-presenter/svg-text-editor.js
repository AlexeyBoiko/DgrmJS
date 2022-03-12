import { svgStrToTspan } from '../infrastructure/svg-utils.js';

export class SvgTextEditorManager {
	/**
	 * @param {SVGGraphicsElement} svgEl
	 */
	constructor(svgEl) {
		this.svgEl = svgEl;
		svgEl.addEventListener('click', this);
	}

	/**
	 * @param {PresenterShapeUpdateParam} param
	 *
	 */
	update(param) {
		if (param.position) {
			/** @private */
			this._firstClick = true;
		}

		if (param.props) {
			/** @private */
			this._props = Object.assign({}, param.props);

			// highlight empty text places
			this.svgEl.querySelectorAll('[data-text-for]').forEach(el => {
				if (!param.props[el.getAttribute('data-text-for')].textContent) {
					el.classList.add('empty');
				}
			});
		}

		if (param.state) {
			if (param.state.has('selected')) { this._firstClick = true; }
		}
	}

	/**
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	handleEvent(evt) {
		evt.stopPropagation();

		if (!this._firstClick) {
			/** @type {SVGRectElement} */
			let placeEl;
			switch (evt.target.tagName) {
				case 'tspan':
					placeEl = this.svgEl.querySelector(`[data-text-for=${evt.target.parentElement.getAttribute('data-key')}]`);
					break;
				case 'text':
					placeEl = this.svgEl.querySelector(`[data-text-for=${evt.target.getAttribute('data-key')}]`);
					break;
				default:
					if (evt.target.getAttribute('data-text-for')) {
						placeEl = /** @type {SVGRectElement} */(evt.target);
					}
					break;
			}

			if (placeEl) {
				inputShow(this.svgEl, placeEl, this._props);
			}
		}
		this._firstClick = false;
	}
}

/**
 * @param {SVGTextElement} textEl
 * @returns {{x:number, lineHeight:number}}
 */
export function textParamsParse(textEl) {
	return {
		x: textEl.x?.baseVal[0]?.value ?? 0,
		lineHeight: parseInt(textEl.getAttribute('data-line-height'))
	};
}

/**
 * @param {SVGGElement} svgEl
 * @param {SVGRectElement} placeEl - where to place input
 * @param {PresenterShapeProps} shapeProps
 * @private
 */
function inputShow(svgEl, placeEl, shapeProps) {
	const textKey = placeEl.getAttribute('data-text-for');
	/** @type {SVGTextElement} */
	const textEl = svgEl.querySelector(`[data-key=${textKey}]`);
	placeEl.classList.remove('empty');

	const foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
	foreignWidthSet(placeEl, foreign, textEl);

	const textarea = document.createElement('textarea');
	textarea.style.width = '100%';
	textarea.style.height = '100%';
	textarea.style.caretColor = textEl.getAttribute('fill');
	textarea.value = shapeProps[textKey].textContent ? shapeProps[textKey].textContent.toString() : null;

	const lineHeight = textParamsParse(textEl);
	textarea.oninput = function() {
		shapeProps[textKey].textContent = textarea.value;
		textEl.innerHTML = svgStrToTspan(textarea.value, lineHeight);
		foreignWidthSet(placeEl, foreign, textEl);
	};

	textarea.onblur = function() {
		foreign.remove();
		if (!textarea.value) { placeEl.classList.add('empty'); } else { placeEl.classList.remove('empty'); }
	};
	textarea.onpointerdown = function(evt) {
		evt.stopImmediatePropagation();
	};
	foreign.appendChild(textarea);

	svgEl.appendChild(foreign);
	textarea.focus();
}

/**
 * @param {SVGRectElement} placeEl - where to place input
 * @param {SVGForeignObjectElement} foreign
 * @param {SVGTextElement} textEl
 * @private
 */
function foreignWidthSet(placeEl, foreign, textEl) {
	const textBbox = textEl.getBBox();

	foreign.width.baseVal.value = textBbox.width;
	foreign.x.baseVal.value = textBbox.x;

	foreign.height.baseVal.value = textBbox.height;
	foreign.y.baseVal.value = textBbox.y;
}
