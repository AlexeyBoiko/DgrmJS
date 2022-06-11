interface DiagramPrivateConnectorEnd extends DiagramConnectorEnd {
	shape: IPresenterShape;
	/** connector id */
	key: string;
}
interface DiagramPrivateShapeConnectParam extends DiagramPathAddParam {
	start: DiagramPrivateConnectorEnd | IPresenterConnector;
	end: DiagramPrivateConnectorEnd | IPresenterConnector;
}