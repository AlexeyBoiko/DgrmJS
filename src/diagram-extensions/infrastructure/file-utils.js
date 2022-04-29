/**
 * save file to user
 * @param {Blob} blob
 * @param {string} name
 */
export function fileSave(blob, name) {
	const link = document.createElement('a');
	link.download = name;
	link.href = URL.createObjectURL(blob);
	link.click();
	URL.revokeObjectURL(link.href);
	link.remove();
}

/**
 * @param {string} accept
 * @param {BlobCallback} callBack
 */
export function fileOpen(accept, callBack) {
	const input = document.createElement('input');
	input.type = 'file';
	input.multiple = false;
	input.accept = accept;
	input.onchange = async function() {
		callBack((!input.files?.length) ? null : input.files[0]);
	};
	input.click();
	input.remove();
}
