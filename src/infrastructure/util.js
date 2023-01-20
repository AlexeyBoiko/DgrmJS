//
// dom utils

/**
 * @template T
 * @param {Element} parent
 * @param {string} key
 * @returns T
 */
export const child = (parent, key) => /** @type {T} */(parent.querySelector(`[data-key="${key}"]`));

/** @param {HTMLElement|SVGElement} crcl, @param {Point} pos */
export function positionSet(crcl, pos) { crcl.style.transform = `translate(${pos.x}px, ${pos.y}px)`; }

/** @param {Element} el, @param {string[]} cl */
export const classAdd = (el, ...cl) => el?.classList.add(...cl);

/** @param {Element} el, @param {string} cl */
export const classDel = (el, cl) => el?.classList.remove(cl);

/** @param {Element} el, @param {string} cl */
export const classHas = (el, cl) => el?.classList.contains(cl);

/** @param {Element} el, @param {string} type, @param {EventListenerOrEventListenerObject} listener, @param {boolean?=} once */
export const listen = (el, type, listener, once) => el.addEventListener(type, listener, { passive: true, once });

/** @param {Element} el, @param {string} type, @param {EventListenerOrEventListenerObject} listener, @param {boolean?=} capture */
export const listenDel = (el, type, listener, capture) => el?.removeEventListener(type, listener, { capture });

/**
 * @template {keyof SVGElementTagNameMap} T
 * @param {T} qualifiedName
 * @param {string?=} innerHTML
 * @returns {SVGElementTagNameMap[T]}
 */
export function svgEl(qualifiedName, innerHTML) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', qualifiedName);
	if (innerHTML) { svgGrp.innerHTML = innerHTML; }
	return svgGrp;
}

/**
 * calc farthest point of <tspan>s bbox in {textEl}
 * origin is in the center
 * @param {SVGTextElement} textEl
 */
export function svgTxtFarthestPoint(textEl) {
	/** @type {Point} */
	let maxPoint;
	let maxAbsSum = 0;
	for (const span of textEl.getElementsByTagName('tspan')) {
		for (const point of boxPoints(span.getBBox())) {
			const pointAbsSum = Math.abs(point.x) + Math.abs(point.y);
			if (maxAbsSum < pointAbsSum) {
				maxPoint = point;
				maxAbsSum = pointAbsSum;
			}
		}
	}
	return maxPoint;
}

/** @param {DOMRect} box */
const boxPoints = (box) => [
	{ x: box.x, y: box.y },
	{ x: box.right, y: box.y },
	{ x: box.x, y: box.bottom },
	{ x: box.right, y: box.bottom }
];

//
// math, arr utils

/**
 * Get the ceiling for a number {val} with a given floor height {step}
 * @param {number} min
 * @param {number} step
 * @param {number} val
 */
export function ceil(min, step, val) {
	if (val <= min) { return min; }
	return min + Math.ceil((val - min) / step) * step;
}

/**
 * @template T
 * @param {Array<T>} arr
 * @param {{(el:T):void}} action
 */
export function arrPop(arr, action) {
	let itm = arr.pop();
	while (itm) { action(itm); itm = arr.pop(); };
}

/** @typedef { {x:number, y:number} } Point */
