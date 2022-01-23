interface IConnectorManager {
	add(connectorStart: IPresenterConnector, connectorEnd: IPresenterConnector): void;

	/** reconect to new connector */
	replaceEnd(connectorOld: IPresenterConnector, connectorNew: IPresenterConnector): void;

	/** get start connector element by the end connector element */
	startConnectorGet(connector: IPresenterConnector): IPresenterConnector;

	/** update connectors of the shape */
	updatePosition(shape: IPresenterShape): void;

	/** delete related to shape connectors */
	deleteByShape(shape: IPresenterShape): void;
}