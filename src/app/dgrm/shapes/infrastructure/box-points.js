/**
 * @param {DOMRect} box
 * @param {number?=} padding
 * @returns {Point[]}
 */
export function boxPoints(box, padding = 0) {
	const leftX = box.x - padding;
	const rightX = box.x + box.width + padding;
	const topY = box.y - padding;
	const bottomY = box.y + box.height + padding;
	return [
		{ x: leftX, y: topY },
		{ x: rightX, y: topY },
		{ x: leftX, y: bottomY },
		{ x: rightX, y: bottomY }
	];
}
