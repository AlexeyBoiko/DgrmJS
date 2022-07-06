const storeApi = 'https://localhost:7156/api';

/**
 * @param {string} key
 * @param {AppSerializeData} diagramData
 * @returns {Promise}
 */
export async function storeSave(key, diagramData) {
	return await fetch(`${storeApi}/${key}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json;charset=utf-8'	},
		body: JSON.stringify(diagramData)
	});
}

/**
 * get diagram json by key
 * @param {string} key
 * @returns {Promise<AppSerializeData>}
 */
export async function storeGet(key) {
	return (await fetch(`${storeApi}/${key}`)).json();
}

export function generateKey() {
	const arr = new Uint8Array((8 / 2));
	window.crypto.getRandomValues(arr);
	const date = new Date();
	return `${date.getUTCFullYear()}${(date.getUTCMonth() + 1).toString().padStart(2, '0')}${Array.from(arr, dec => dec.toString(16).padStart(2, '0')).join('')}`;
}
