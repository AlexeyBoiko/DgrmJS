import { ceil, child, classAdd, classDel, positionSet } from '../infrastructure/util.js';
import { rectTxtSettingsPnlCreate } from './rect-txt-settings.js';
import { shapeCreate } from './shape-evt-proc.js';
import { settingsPnlCreate } from './shape-settings.js';
import { ShapeSmbl } from './shape-smbl.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {RectData} rectData
 */
export function rect(svg, canvasData, rectData) {
	rectData.w = rectData.w ?? 96;
	rectData.h = rectData.h ?? 48;
	rectData.a = rectData.a ?? (rectData.t ? 1 : 2);

	const templ = `
		<rect data-key="outer" data-evt-no data-evt-index="2" width="144" height="96" x="-72" y="-48" fill="transparent" stroke="transparent" stroke-width="0" />
		<rect data-key="main" width="96" height="48" x="-48" y="-24" rx="15" ry="15" fill="#1aaee5" stroke="#fff" stroke-width="1" />
		<text data-key="text" y="0" x="${rectTxtXByAlign(rectData)}" style="pointer-events: none;" fill="#fff">&nbsp;</text>`;

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
		},
		// settingsPnlCreateFn
		rectData.t ? rectTxtSettingsPnlCreate : settingsPnlCreate);

	classAdd(shape.el, rectData.t ? 'shtxt' : 'shrect');

	let currentW = rectData.w;
	let currentTxtAlign = rectData.a;
	/** @param {boolean?=} fixTxtAlign */
	function resize(fixTxtAlign) {
		const mainX = rectData.w / -2;
		const mainY = rectData.h / -2;
		const middleX = 0;

		shape.cons.right.position.x = -mainX;
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

		// if text align or width changed
		// fix text align
		if (fixTxtAlign || currentTxtAlign !== rectData.a || currentW !== rectData.w) {
			let txtX;
			let posXDelta;
			switch (rectData.a) {
				// text align left
				case 1:
					txtX = mainX + 8;
					posXDelta = (rectData.w - currentW) / 2;
					break;
				case 2:
					txtX = 0;
					posXDelta = 0;
					break;
				// text align right
				case 3:
					txtX = -mainX - 8;
					posXDelta = (rectData.w - currentW) / -2;
					break;
			}

			const txtEl = child(shape.el, 'text');
			txtEl.x.baseVal[0].value = txtX;
			txtEl.querySelectorAll('tspan').forEach(ss => { ss.x.baseVal[0].value = txtX; });

			rectData.position.x += posXDelta;

			classDel(shape.el, `ta-${currentTxtAlign}`);
			classAdd(shape.el, `ta-${rectData.a}`);

			currentTxtAlign = rectData.a;
			currentW = rectData.w;
		}

		shape.draw();
	}

	classAdd(shape.el, `ta-${rectData.a}`);
	if (rectData.w !== 96 || rectData.h !== 48) { resize(true); } else { shape.draw(); }

	shape.el[ShapeSmbl].draw = resize;

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

/** @param {RectData} rectData */
const rectTxtXByAlign = rectData => rectData.a === 1
	? -40 // text align keft
	: rectData.a === 2
		? 0 // text align middle
		: 40; // text align right

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('./shape-evt-proc').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc').ConnectorsData } ConnectorsData */
/**
@typedef {{
	type:number, position: Point, title?: string, styles?: string[],
	w?:number, h?:number
	t?:boolean,
	a?: 1|2|3
}} RectData */
