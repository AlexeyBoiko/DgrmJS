// interface IConnectorShapePathPoints {
// 	startInnerPosition?: Point, 
// 	endInnerPosition?: Point
// }

interface IConnetorShape extends IPresenterShape {
	connectedPaths?: Set<IConnectorPath>;
}

interface IConnectorConnector extends IPresenterConnector {
	shape: IConnetorShape;
	// 	connectedPaths?: Map<IPresenterPath, PresenterPathEndType>;
}

interface IConnectorPath extends IPresenterPath {
	start: IConnectorConnector;
	end: IConnectorConnector;
}

