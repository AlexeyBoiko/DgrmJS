/** @type {HTMLDivElement} */
let editModalDiv;
/** @param {number} bottomX, @param {number} bottomY, @param {HTMLElement} elem */
export function modalCreate(bottomX, bottomY, elem) {
	editModalDiv = document.createElement('div');
	editModalDiv.style.cssText = 'position: fixed; box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%); border-radius: 16px; background-color: rgba(255,255,255, .9);';
	editModalDiv.append(elem);
	document.body.append(editModalDiv);

	function position(btmX, btmY) {
		editModalDiv.style.left = `${btmX}px`;
		editModalDiv.style.top = `${window.scrollY + btmY - editModalDiv.getBoundingClientRect().height}px`; // window.scrollY fix IPhone keyboard
	}
	position(bottomX, bottomY);

	return {
		/**
		 * @param {number} bottomX positon of the bottom left corner of the panel
		 * @param {number} bottomY positon of the bottom left corner of the panel
		 */
		position,
		del: () => { editModalDiv.remove(); editModalDiv = null; }
	};
}

/** @param {number} dif */
export function modalChangeTop(dif) {
	editModalDiv.style.top = `${editModalDiv.getBoundingClientRect().top + dif}px`;
}
