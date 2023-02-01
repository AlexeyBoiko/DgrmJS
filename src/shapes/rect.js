import { ceil, child, classAdd, positionSet } from '../infrastructure/util.js';
import { shapeCreate } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {RectData} rectData
 */
export function rect(svg, canvasData, rectData) {
	const templ = `
		<rect data-key="outer" data-evt-no data-evt-index="2" width="144" height="96" x="-72" y="-48" fill="transparent" stroke="transparent" stroke-width="0" />
		<rect data-key="main" width="96" height="48" x="-48" y="-24" rx="15" ry="15" fill="#1aaee5" stroke="#fff" stroke-width="1" />
		<text data-key="text" y="0" ${rectData.t ? 'x="-40"' : 'x="0" text-anchor="middle"'} style="pointer-events: none;" fill="#fff">&nbsp;</text>`;

	const shape = shapeCreate(svg, canvasData, rectData, templ,
		{
			right: { dir: 'right', position: { x: 48, y: 0 } },
			left: { dir: 'left', position: { x: -48, y: 0 } },
			bottom: { dir: 'bottom', position: { x: 0, y: 24 } },
			top: { dir: 'top', position: { x: 0, y: -24 } }
		},
		// onTextChange
		txtEl => {
			const textBox = txtEl.getBBox();
			const newWidth = ceil(96, 48, textBox.width + (rectData.t ? 6 : 0)); // 6 px right padding for text shape
			const newHeight = ceil(48, 48, textBox.height);

			if (rectData.w !== newWidth || rectData.h !== newHeight) {
				rectData.w = newWidth;
				rectData.h = newHeight;
				resize();
			}
		});

	rectData.w = rectData.w ?? 96;
	rectData.h = rectData.h ?? 48;
	if (rectData.t) { classAdd(shape.el, 'shtxt'); }

	function resize() {
		const mainX = rectData.t ? -48 : rectData.w / -2;
		const mainY = rectData.h / -2;
		const middleX = rectData.t ? rectData.w / 2 - 48 : 0;

		shape.cons.right.position.x = rectData.t ? rectData.w - 48 : -mainX;
		shape.cons.left.position.x = mainX;
		shape.cons.bottom.position.y = -mainY;
		shape.cons.bottom.position.x = middleX;
		shape.cons.top.position.y = mainY;
		shape.cons.top.position.x = middleX;
		for (const connectorKey in shape.cons) {
			positionSet(child(shape.el, connectorKey), shape.cons[connectorKey].position);
		}

		rectSet(shape.el, 'main', rectData.w, rectData.h, mainX, mainY);
		rectSet(shape.el, 'outer', rectData.w + 48, rectData.h + 48, mainX - 24, mainY - 24);

		shape.draw();
	}

	if (rectData.w !== 96 || rectData.h !== 48) { resize(); } else { shape.draw(); }

	return shape.el;
}

/**
 * @param {Element} svgGrp, @param {string} key,
 * @param {number} w, @param {number} h
 * @param {number} x, @param {number} y
 */
function rectSet(svgGrp, key, w, h, x, y) {
	/** @type {SVGRectElement} */ const rect = child(svgGrp, key);
	rect.width.baseVal.value = w;
	rect.height.baseVal.value = h;
	rect.x.baseVal.value = x;
	rect.y.baseVal.value = y;
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('./shape-evt-proc.js').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc.js').ConnectorsData } ConnectorsData */
/**
@typedef {{
	type:number, position: Point, title?: string, styles?: string[],
	w?:number, h?:number
	t?:boolean
}} RectData */
