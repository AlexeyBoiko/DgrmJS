interface SerializeData {
	shapes: SerializeShape[],
	/** connector info */
	cons?: DiagramDataConnector[]
}

interface SerializeShape<T = any> extends PresenterShapeAppendParam {
	/** to store additional data associated with the shape */
	detail?: T;
}

interface SerializeConnectorEnd {
	/** index in 'shapes' */
	index: number;
	connector: string;
}

interface DiagramDataConnector {
	start: SerializeConnectorEnd,
	end: SerializeConnectorEnd
}