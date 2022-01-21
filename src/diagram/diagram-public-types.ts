interface IDiagram {
	on(evtType: DiagramEventType, listener: EventListenerOrEventListenerObject): void;
	shapeAdd(param: PresenterShapeAppendParam): IDiagramShape;
	shapeDel(shape: IDiagramShape): void;
	shapeConnect(param: DiagramShapeConnectParam): void;
}

interface IDiagramShape { }

type DiagramEventType = 'select';
interface IDiagramEventDetail {
	target: IDiagramShape;
}

interface DiagramConnectorEnd {
	shape: IDiagramShape;
	/** connector id */
	connector: string;
}
interface DiagramShapeConnectParam {
	start: DiagramConnectorEnd;
	end: DiagramConnectorEnd;
}