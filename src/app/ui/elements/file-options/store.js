const storeApi = 'https://localhost:7156/api';

/**
 * save diagram json and get key
 * @param {AppSerializeData} diagramData
 * @returns {Promise<string>}
 */
export async function storeSave(diagramData) {
	return (await fetch(storeApi, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json;charset=utf-8'	},
		body: JSON.stringify(diagramData)
	})).text();
}

/**
 * get diagram json by key
 * @param {string} key
 * @returns {Promise<AppSerializeData>}
 */
export async function storeGet(key) {
	return (await fetch(`${storeApi}/${key}`)).json();
}
