//
// dom utils

/**
 * @template T
 * @param {Element} parent
 * @param {string} key
 * @returns T
 */
export const child = (parent, key) => /** @type {T} */(parent.querySelector(`[data-key="${key}"]`));

/** @param {Element} el, @param {string} cl */
export const classAdd = (el, cl) => el?.classList.add(cl);

/** @param {Element} el, @param {string} cl */
export const classDel = (el, cl) => el?.classList.remove(cl);

/** @param {Element} el, @param {string} cl */
export const classHas = (el, cl) => el?.classList.contains(cl);

//
// math utils

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
