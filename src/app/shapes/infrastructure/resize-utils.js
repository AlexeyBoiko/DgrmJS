/**
 * get the ceiling for a number {val} with a given floor height {step}
 * @param {number} min
 * @param {number} step
 * @param {number} val
 */
export function ceil(min, step, val) {
	if (val <= min) { return min; }
	return min + Math.ceil((val - min) / step) * step;
}

/**
 * Find minimal val when !isOutFunc()
 * @param {number} minVal
 * @param {number} incrementVal
 * @param {number} currentVal
 * @param {(val:number)=> boolean} isOutFunc
 * @returns {number|null}
 */
export function resizeAlg(minVal, incrementVal, currentVal, isOutFunc) {
	let testVal = currentVal;
	if (isOutFunc(testVal)) {
		do { testVal += incrementVal; }
		while (isOutFunc(testVal));

		return testVal;
	} else {
		if (minVal === testVal) { return null; }

		do { testVal -= incrementVal; }
		while (minVal <= testVal && !isOutFunc(testVal));

		testVal += incrementVal;
		return currentVal !== testVal
			? testVal
			: null;
	}
}
