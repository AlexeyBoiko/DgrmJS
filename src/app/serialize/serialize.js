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
		s: []
	};

	/** @type {Map<IDiagramShape, number>} */
	const shapeIndex = new Map();

	for (const shape of shapeData) {
		shape[1].position = shape[0].positionGet();
		shapeIndex.set(shape[0], serializeData.s.push(shape[1]) - 1);
	}

	if (connectors && connectors.length > 0) {
		serializeData.c = connectors.map(cc => ({
			s: { i: shapeIndex.get(cc.start.shape), c: cc.start.key },
			e: { i: shapeIndex.get(cc.end.shape), c: cc.end.key }
		}));
	}

	return JSON.stringify(serializeData);
}
