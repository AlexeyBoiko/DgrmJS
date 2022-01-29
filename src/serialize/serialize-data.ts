interface SerializeData {
	/** shapes */
	s: SerializeShape[],
	/** connector info */
	c?: DiagramDataConnector[]
}

interface SerializeShape<T = any> extends PresenterShapeAppendParam {
	/** to store additional data associated with the shape */
	detail?: T;
}

interface SerializeConnectorEnd {
	/** index in 'shapes' */
	i: number;
	/** connector */
	c: string;
}

interface DiagramDataConnector {
	/** start */
	s: SerializeConnectorEnd,
	/** end */
	e: SerializeConnectorEnd
}