interface IConnectorManager {
	/**
	 * @param connectorInElemStart type must be connectorInElem
	 * @param connectorInElemEnd type must be connectorInElem
	 */
	add(connectorInElemStart: IPresenterFigure, connectorInElemEnd: IPresenterFigure): void;

	/** 
	 * reconect to new connectorInElem 
	 * @param connectorInElemOld type must be connectorInElem
	 * @param connectorInElemNew type must be connectorInElem
	 */
	replaceEnd(connectorInElemOld: IPresenterFigure, connectorInElemNew: IPresenterFigure): void;

	/**
	 * update connectors of the shape
	 */
	updatePosition(shape: IPresenterFigure): void;

	/**
	 * count of connectors of connectorInElem 
	 * @param connectorInElem type must be connectorInElem
	 */
	count(connectorInElem: IPresenterFigure, endType: PresenterPathEndType): number;
}