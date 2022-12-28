/** @type {HTMLDivElement} */ let overlay;
/** @param {boolean} isDisable */
export function uiDisable(isDisable) {
	if (isDisable && !overlay) {
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
		overlay.classList.add('blnk');
		document.body.append(overlay);
	} else if (!isDisable) {
		overlay.remove();
		overlay = null;
	}
}

/** @param {boolean} show */
export function tipShow(show) {
	document.getElementById('diagram').style.pointerEvents = show ? 'none' : 'unset';
	document.getElementById('tip').style.display = show ? 'unset' : 'none';
}
