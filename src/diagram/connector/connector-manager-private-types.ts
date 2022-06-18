interface IConnetorShape extends IPresenterShape {
	connectedPaths?: Set<IConnectorPath>;
}

interface IConnectorConnector extends IPresenterConnector {
	shape: IConnetorShape;
}

interface IConnectorPath extends IPresenterPath {
	get start(): IConnectorConnector;
	get end(): IConnectorConnector;
}

