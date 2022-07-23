interface IConnectorManager {
	add(connectorStart: IPresenterConnector, connectorEnd: IPresenterConnector): IPresenterPath;

	/** reconect to new connector */
	replaceEnd(path: IConnectorPath, connectorNew: IPresenterConnector): void;

	/** update connectors of the shape */
	updatePosition(shape: IPresenterShape): void;

	/** delete shape and related to shape connectors */
	del(shapeOrPath: IPresenterShape | IPresenterPath): void;
}