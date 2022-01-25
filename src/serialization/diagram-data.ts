interface DiagramData {
	shapes: DiagramDataShape[],
	/** connector info */
	cons?: DiagramDataConnector[]
}

interface DiagramDataShape <T = any> extends PresenterShapeAppendParam {
	/** to store additional data associated with the shape */
	detail?:T;
	/** ref to shape if it already added to diagram */
	ref?:IDiagramShape;
}

interface DiagramDataConnectorEnd {
	/** index in 'shapes' */
	index: number;
	connector: string;
}

interface DiagramDataConnector {
	start:DiagramDataConnectorEnd,
	end:DiagramDataConnectorEnd
}