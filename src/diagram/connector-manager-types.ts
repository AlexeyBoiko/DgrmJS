interface IConnectorManager {
	add(connectorStart: IPresenterConnector, connectorEnd: IPresenterConnector): void;

	/** 
	 * reconect to new connector
	 */
	replaceEnd(connectorOld: IPresenterConnector, connectorNew: IPresenterConnector): void;

	/**
	 * update connectors of the shape
	 */
	updatePosition(shape: IPresenterShape): void;

	/**
	 * delete related to shape connectors
	 */
	deleteByShape(shape: IPresenterShape): void;
}