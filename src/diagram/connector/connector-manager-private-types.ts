interface IConnectorElement extends IPresenterFigure {
	connectedPaths?: Map<IPresenterPath, PresenterPathEndType>
}

interface IConnectorInElement extends IPresenterConnectorElement, IConnectorElement { 
	shape: IConnectorElement
}