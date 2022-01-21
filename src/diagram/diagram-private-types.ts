interface DiagramPrivateConnectorEnd extends DiagramConnectorEnd {
	shape: IPresenterShape;
	/** connector id */
	connector: string;
}
interface DiagramPrivateShapeConnectParam extends DiagramShapeConnectParam {
	start: DiagramPrivateConnectorEnd;
	end: DiagramPrivateConnectorEnd;
}