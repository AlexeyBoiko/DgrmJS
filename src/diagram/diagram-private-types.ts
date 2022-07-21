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
}

interface IDiagramPrivateEventProcessor {
	process(elem: IDiagramElement, evt: CustomEvent<IPresenterEventDetail>): void;
}