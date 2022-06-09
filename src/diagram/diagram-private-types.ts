interface DiagramPrivateConnectorEnd extends DiagramConnectorEnd {
	shape: IPresenterShape;
	/** connector id */
	key: string;
}
interface DiagramPrivateShapeConnectParam extends DiagramShapeConnectParam {
	start: DiagramPrivateConnectorEnd | IPresenterConnector;
	end: DiagramPrivateConnectorEnd | IPresenterConnector;
}