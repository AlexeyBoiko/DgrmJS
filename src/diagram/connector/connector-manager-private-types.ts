interface IConnectorElement extends IPresenterShape {
	connectedPaths?: Map<IPresenterPath, PresenterPathEndType>
}

interface IConnectorInElement extends IPresenterConnector, IConnectorElement { 
	shape: IConnectorElement
}