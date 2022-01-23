interface DiagramData {
	shapes: DiagramDataShape[],
	/** connector info */
	cons?:[
		/** index of shape in 'shapes' */
		{start:DiagramDataConnector,end:DiagramDataConnector}
	]
}

interface DiagramDataShape <T = any> extends PresenterShapeAppendParam {
	/** to store additional data associated with the shape */
	detail?:T;
}

interface DiagramDataConnector {
	/** index in 'shapes' */
	index: number;
	connector: string;
}