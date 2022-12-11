const svrApi = 'https://localhost:7156/api';

/**
 * @param {string} key
 * @param {DiagramSerialized} serialized
 * @returns {Promise}
 */
export async function srvSave(key, serialized) {
	return await fetch(`${svrApi}/${key}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json;charset=utf-8'	},
		body: JSON.stringify(serialized)
	});
}

/**
 * get diagram json by key
 * @param {string} key
 * @returns {Promise<DiagramSerialized>}
 */
export async function srvGet(key) {
	return (await fetch(`${svrApi}/${key}`)).json();
}

export function generateKey() {
	const arr = new Uint8Array((8 / 2));
	window.crypto.getRandomValues(arr);
	const date = new Date();
	return `${date.getUTCFullYear()}${(date.getUTCMonth() + 1).toString().padStart(2, '0')}${Array.from(arr, dec => dec.toString(16).padStart(2, '0')).join('')}`;
}

/** @typedef { import("./dgrm-serialization").DiagramSerialized } DiagramSerialized */
