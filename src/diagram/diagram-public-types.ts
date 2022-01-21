interface IDiagram {
	on(evtType: DiagramEventType, listener: EventListenerOrEventListenerObject): this;
	shapeAdd(param: PresenterShapeAppendParam): IDiagramShape;
	shapeDel(shape: IDiagramShape): void;
	shapeConnect(param: DiagramShapeConnectParam): void;
}

interface IDiagramShape {
	type: PresenterElementType;
	update(param: PresenterShapeUpdateParam): void;
 }

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