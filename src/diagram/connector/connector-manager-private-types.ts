// export interface IConnectorShapePathPoints {
// 	startInnerPosition?: Point, 
// 	endInnerPosition?: Point
// }

import { IPresenterConnector, IPresenterPath, IPresenterShape } from '../presenter-types';

export interface IConnetorShape extends IPresenterShape {
	connectedPaths?: Set<IConnectorPath>;
}

export interface IConnectorConnector extends IPresenterConnector {
	shape: IConnetorShape;
	// 	connectedPaths?: Map<IPresenterPath, PresenterPathEndType>;
}

export interface IConnectorPath extends IPresenterPath {
	start: IConnectorConnector;
	end: IConnectorConnector;
}

