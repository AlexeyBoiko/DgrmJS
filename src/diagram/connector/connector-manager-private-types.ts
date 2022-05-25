interface IConnetorShape extends IPresenterShape {
	connectedPaths?: Set<IConnectorPath>;
}

interface IConnectorConnector extends IPresenterConnector {
	shape: IConnetorShape;
}

interface IConnectorPath extends IPresenterPath {
	start: IConnectorConnector;
	end: IConnectorConnector;
}

