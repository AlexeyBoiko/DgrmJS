interface DiagramPrivateConnectorEnd extends DiagramConnectorEnd {
	shape: IPresenterShape;
	/** connector id */
	key: string;
}

interface DiagramPrivateShapeConnectParam extends DiagramPathAddParam {
	start: DiagramPrivateConnectorEnd | IPresenterConnector;
	end: DiagramPrivateConnectorEnd | IPresenterConnector;
}

interface IDiagramPrivate extends IDiagram {
	dispatch(type: DiagramEventType, target: IDiagramElement): boolean;
	get activeElement(): IDiagramElement;
	selected: IDiagramElement;
}


interface IDiagramPrivateEventDetail extends IPresenterEventDetail {
	/** filled for 'pointerleave' evt */
	enterTo?: IDiagramElement;
}

type DiagramPrivateEventType = 'unselect' | PresenterEventType;
interface IDiagramPrivateEvent {
	type: DiagramPrivateEventType;
	detail?: IDiagramPrivateEventDetail;
}

interface IDiagramPrivateEventProcessor {
	process(elem: IDiagramElement, evt: IDiagramPrivateEvent): void;
}
