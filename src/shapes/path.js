import { moveEventProcess } from './move-event-process.js';

/**
 * @param { {position:Point, scale:number} } canvasData
 * @param { PathData } pathData
 */
export function path(canvasData, pathData) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.classList.add('path');
	svgGrp.innerHTML =
		`<path data-key="outer" d="M0 0" stroke="transparent" stroke-width="20" fill="none" />
		<path data-key="path" d="M0 0" stroke="#333" stroke-width="1.8" fill="none" style="pointer-events: none;" />
		<path data-key="selected" d="M0 0" stroke="#333" stroke-width="1.8" fill="none" style="pointer-events: none;" />
		<g data-key="arrow">
			<circle r="10" stroke-width="1" fill="transparent" stroke="red" />
			<path d="M-7 7 l 7 -7 l -7 -7" stroke="#333" stroke-width="1.8" fill="none" style="pointer-events: none;"></path>
		</g>`;

	const path = svgGrp.querySelector('[data-key="path"]');
	const outer = svgGrp.querySelector('[data-key="outer"]');
	const selected = svgGrp.querySelector('[data-key="selected"]');
	/** @type {SVGElement} */
	const arrow = svgGrp.querySelector('[data-key="arrow"]');

	function draw() {
		// path
		const dAttr = pathCalc(pathData);
		path.setAttribute('d', dAttr);
		outer.setAttribute('d', dAttr);
		selected.setAttribute('d', dAttr);

		// arrow
		const angle = pathData.end.dir === 'right'
			? 180
			: pathData.end.dir === 'left'
				? 0
				: pathData.end.dir === 'bottom'
					? 270
					: 90;
		arrow.style.transform = `translate(${pathData.end.position.x}px, ${pathData.end.position.y}px) rotate(${angle}deg)`;
	}
	draw();

	/** @type { {():void} } */
	let hoverEmulateDispose;
	moveEventProcess(
		arrow,
		canvasData,
		pathData.end.position,
		// onMoveStart
		_ => {
			hoverEmulateDispose = hoverEmulate(svgGrp.parentElement);
		},
		// onMove
		() => {
			draw();
		},
		// onMoveEnd
		() => {
			hoverEmulateDispose();
		},
		// onClick
		() => {
			// svgGrp.classList.add('selected');
		},
		// onOutdown
		() => {
			// svgGrp.classList.remove('selected');
		}
	);

	return {
		elem: svgGrp,
		draw,
		setPointerCapture: /** @param {number} pointerId */(pointerId) => {
			arrow.setPointerCapture(pointerId);
		}
	};
}

/** @param {PathData} pathData */
function pathCalc(pathData) {
	const coef = Math.hypot(pathData.start.position.x - pathData.end.position.x, pathData.start.position.y - pathData.end.position.y) * 0.5;

	/** @param {PathEnd} pathEnd */
	function cx(pathEnd) {
		return (pathEnd.dir === 'right' || pathEnd.dir === 'left')
			? pathEnd.dir === 'right' ? pathEnd.position.x + coef : pathEnd.position.x - coef
			: pathEnd.position.x;
	}

	/** @param {PathEnd} pathEnd */
	function cy(pathEnd) {
		return (pathEnd.dir === 'right' || pathEnd.dir === 'left')
			? pathEnd.position.y
			: pathEnd.dir === 'bottom' ? pathEnd.position.y + coef : pathEnd.position.y - coef;
	}

	return `M ${pathData.start.position.x} ${pathData.start.position.y} C ${cx(pathData.start)} ${cy(pathData.start)}, ` +
		`${cx(pathData.end)} ${cy(pathData.end)}, ${pathData.end.position.x} ${pathData.end.position.y}`;
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { {position: Point, dir: 'left' | 'right' | 'top' | 'bottom'} } PathEnd */
/** @typedef { {start:PathEnd, end:PathEnd} } PathData */

/** @param {Element} element */
function hoverEmulate(element) {
	element.classList.add('connector-active');

	/** @type {Element} */
	let elemFromPoint = null;

	/** @param {PointerEvent} evt */
	function move(evt) {
		const elemFromPointNew = document.elementFromPoint(evt.clientX, evt.clientY);
		if (elemFromPoint !== elemFromPointNew) {
			if (elemFromPointNew.classList.contains('hovertrack')) {
				elemFromPointNew.classList.add('hover');
			}
			let parentHover = false;
			if (elemFromPointNew.parentElement.classList.contains('hovertrack')) {
				elemFromPointNew.parentElement.classList.add('hover');
				parentHover = true;
			}

			elemFromPoint?.classList.remove('hover');
			if (elemFromPoint?.parentElement !== elemFromPointNew.parentElement || !parentHover) {
				elemFromPoint?.parentElement.classList.remove('hover');
			}

			elemFromPoint = elemFromPointNew;
		}
	}

	element.addEventListener('pointermove', move, { passive: true });
	// dispose fn
	return function() {
		element.removeEventListener('pointermove', move);
		element.classList.remove('connector-active');
		elemFromPoint.classList.remove('hover');
		elemFromPoint.parentElement.classList.remove('hover');
		elemFromPoint = null;
	};
}
