/** @type {HTMLDivElement} */
let overlay;

/**
 * @param {boolean} isDisable
 */
export function uiDisable(isDisable) {
	if (isDisable) {
		overlay = document.createElement('div');
		overlay.style.cssText = 'z-index: 2; position: fixed; left: 0; top: 0; width:100%; height:100%; background: #fff; opacity: 0';
		overlay.classList.add('blnk');
		overlay.innerHTML =
		`<style>
		@keyframes blnk {
			0% { opacity: 0; }
			50% { opacity: 0.55; }
			100% {opacity: 0;}
		}
		.blnk { animation: blnk 1.6s linear infinite; }
		</style>`;
		document.body.append(overlay);
	} else if (isDisable) {
		overlay.remove();
		overlay = null;
	}
}
