import { DiagramConnectorEnd, DiagramShapeConnectParam } from './diagram-public-types';
import { IPresenterShape } from './presenter-types';

export interface DiagramPrivateConnectorEnd extends DiagramConnectorEnd {
	shape: IPresenterShape;
	/** connector id */
	connector: string;
}
export interface DiagramPrivateShapeConnectParam extends DiagramShapeConnectParam {
	start: DiagramPrivateConnectorEnd;
	end: DiagramPrivateConnectorEnd;
}