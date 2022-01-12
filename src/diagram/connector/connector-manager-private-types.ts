interface IConnectorShapePathPoints {
	startInnerPosition?: Point, 
	endInnerPosition?: Point
}

interface IConnetorShape extends IPresenterShape {
	connectedPaths?: Map<IPresenterPath, IConnectorShapePathPoints>;
}

interface IConnectorConnector extends IPresenterConnector { 
	shape: IConnetorShape;
	connectedPaths?: Map<IPresenterPath, PresenterPathEndType>;
}