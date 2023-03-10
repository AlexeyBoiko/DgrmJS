/** @param {Element} elem */
export function evtRouteApplay(elem) {
	elem.addEventListener('pointerdown', /** @param {RouteEvent} evt */ evt => {
		if (!evt.isPrimary || evt[RouteedSmbl] || !evt.isTrusted) { return; }

		evt.stopImmediatePropagation();

		const newEvt = new PointerEvent('pointerdown', evt);
		newEvt[RouteedSmbl] = true;
		activeElemFromPoint(evt).dispatchEvent(newEvt);
	}, { capture: true, passive: true });
}

/** @param { {clientX:number, clientY:number} } evt */
function activeElemFromPoint(evt) {
	return elemFromPointByPrioity(evt).find(el => !el.hasAttribute('data-evt-no'));
}

/** @param { {clientX:number, clientY:number} } evt */
export function priorityElemFromPoint(evt) {
	return elemFromPointByPrioity(evt)[0];
}

/** @param { {clientX:number, clientY:number} } evt */
function elemFromPointByPrioity(evt) {
	return document.elementsFromPoint(evt.clientX, evt.clientY)
		.sort((a, b) => {
			const ai = a.getAttribute('data-evt-index');
			const bi = b.getAttribute('data-evt-index');
			return (ai === bi) ? 0 : ai > bi ? -1 : 1;
		});
}

const RouteedSmbl = Symbol('routeed');
/** @typedef {PointerEvent & { [RouteedSmbl]?: boolean }} RouteEvent */
