interface IConnectorInnerPoint {
	/** postion into shape */
	innerPosition: Point;
	pathEndType: PresenterPathEndType;
}

interface IConnetorShape extends IPresenterShape {
	connectedPaths?: Map<IPresenterPath, IConnectorInnerPoint>;
}

interface IConnectorConnector extends IPresenterConnector { 
	shape: IConnetorShape;
	connectedPaths?: Map<IPresenterPath, PresenterPathEndType>;
}