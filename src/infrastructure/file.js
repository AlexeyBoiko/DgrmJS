/**
 * save file to user
 * @param {Blob} blob
 * @param {string} name
 */
export function fileSave(blob, name) { ('showSaveFilePicker' in window) ? fileSaveAs(blob) : fileDownload(blob, name); }

/**
 * save file with "File save as" dialog
 * @param {Blob} blob
 */
async function fileSaveAs(blob) {
	try {
		// @ts-ignore
		const writable = await (await window.showSaveFilePicker({
			types: [
				{
					description: 'PNG Image',
					accept: {
						'image/png': ['.png']
					}
				}
			]
		})).createWritable();
		await writable.write(blob);
		await writable.close();
	} catch {
		alert('File not saved');
	}
}

/**
 * save file with default download process
 * @param {Blob} blob
 * @param {string} name
 */
function fileDownload(blob, name) {
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
