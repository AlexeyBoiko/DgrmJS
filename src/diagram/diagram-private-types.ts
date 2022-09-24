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
	dispatch(type: DiagramEventType, target?: IDiagramElement): boolean;
}


interface IDiagramPrivateEventDetail extends IPresenterEventDetail {
	/** filled for 'pointerleave' evt */
	enterTo?: IDiagramElement;
}

type DiagramPrivateEventType = 'unselect' | 'unactive' | PresenterEventType;
interface IDiagramPrivateEvent {
	type: DiagramPrivateEventType;
	detail?: IDiagramPrivateEventDetail;
}

interface IDiagramPrivateEventProcessor {
	canProcess(elem: IDiagramElement): boolean;
	process(elem: IDiagramElement, evt: IDiagramPrivateEvent): void;
}
