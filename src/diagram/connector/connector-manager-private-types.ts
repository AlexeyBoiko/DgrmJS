interface IConnectorElement extends IPresenterFigure {
	connectedPaths?: Map<IPresenterPath, PresenterPathEndType>
}

interface IConnectorInElement extends IPresenterConnectorInElement, IConnectorElement { 
	shape: IConnectorElement
}