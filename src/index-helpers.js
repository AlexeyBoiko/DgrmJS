/**
 * @param {IDiagramEventConnectDetail} con1
 * @param {IDiagramEventConnectDetail} con2
 * @returns {boolean}
 */
export function connectorEqual(con1, con2) {
	return con1.start.shape === con2.start.shape && con1.start.key === con2.start.key &&
	con1.end.shape === con2.end.shape && con1.end.key === con2.end.key;
}

/**
 * @param {string} templateKey
 * @param {string} text
 * @returns {string}
 */
export function textContentTrim(templateKey, text) {
	return (text && templateKey !== 'text') ? text.replaceAll('\n', ' ') : text;
}
