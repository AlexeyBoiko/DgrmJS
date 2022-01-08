interface IConnectorManager {
	add(connectorStart: IPresenterConnector, connectorEnd: IPresenterConnector): void;

	/** 
	 * reconect to new connectorInElem 
	 */
	replaceEnd(connectorOld: IPresenterConnector, connectorNew: IPresenterConnector): void;

	/**
	 * update connectors of the shape
	 */
	updatePosition(shape: IPresenterShape): void;

	/**
	 * count of connectors of connectorInElem 
	 */
	any(connector: IPresenterConnector, endType: PresenterPathEndType): boolean;
}