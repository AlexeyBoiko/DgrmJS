/**
 * @param {Map<IDiagramShape, SerializeShape<string>>} shapeData
 * @param {IDiagramEventConnectDetail[]} connectors
 * @returns {string|null}
 */
export function serialize(shapeData, connectors) {
	if (!shapeData || shapeData.size === 0) {
		return null;
	}

	/** @type {SerializeData} */
	const serializeData = {
		shapes: []
	};

	/** @type {Map<IDiagramShape, number>} */
	const shapeIndex = new Map();

	for (const shape of shapeData) {
		shape[1].position = shape[0].postionGet();
		shapeIndex.set(shape[0], serializeData.shapes.push(shape[1]) - 1);
	}

	if (connectors && connectors.length > 0) {
		serializeData.cons = connectors.map(cc => ({
			start: { index: shapeIndex.get(cc.start.shape), connector: cc.start.key },
			end: { index: shapeIndex.get(cc.end.shape), connector: cc.end.key }
		}));
	}

	return JSON.stringify(serializeData);
}
