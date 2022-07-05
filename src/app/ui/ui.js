/** @type {HTMLDivElement} */
let overlay;

/**
 * @param {boolean} isDisable
 * @param {boolean=} isBlink
 */
export function uiDisable(isDisable, isBlink) {
	if (isDisable) {
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.style.cssText = 'z-index: 2; position: fixed; left: 0; top: 0; width:100%; height:100%; background: #fff; opacity: 0';
			overlay.innerHTML =
			`<style>
			@keyframes blnk {
				0% { opacity: 0; }
				50% { opacity: 0.7; }
				100% {opacity: 0;}
			}
			.blnk { animation: blnk 1.6s linear infinite; }
			</style>`;
			document.body.append(overlay);
		}

		if (isBlink) {
			overlay.classList.add('blnk');
		} else { overlay.classList.remove('blnk'); }
	} else if (!isDisable && overlay) {
		overlay.remove();
		overlay = null;
	}
}
