interface IConnectorManager {
	/**
	 * @param connectorInElemStart type must be connectorInElem
	 * @param connectorInElemEnd type must be connectorInElem
	 */
	connectorAdd(connectorInElemStart: IPresenterElement, connectorInElemEnd: IPresenterElement): void;

	/** 
	 * reconect to new connectorInElem 
	 * @param connectorInElemOld type must be connectorInElem
	 * @param connectorInElemNew type must be connectorInElem
	 */
	connectorReplaceElem(connectorInElemOld: IPresenterElement, connectorInElemNew: IPresenterElement): void;

	/**
	 * update connectors of the shape
	 */
	connectorsUpdatePosition(shape: IPresenterElement): void;

	/**
	 * count of connectors of connectorInElem 
	 * @param connectorInElem type must be connectorInElem
	 */
	connectorCount(connectorInElem: IPresenterElement): number;
}