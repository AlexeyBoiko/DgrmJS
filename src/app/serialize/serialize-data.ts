import { PresenterShapeAppendParam } from '../../diagram/presenter-types';

export interface SerializeData {
	/** shapes */
	s: SerializeShape[],
	/** connector info */
	c?: DiagramDataConnector[]
}

export interface SerializeShape<T = any> extends PresenterShapeAppendParam {
	/** to store additional data associated with the shape */
	detail?: T;
}

export interface SerializeConnectorEnd {
	/** index in 'shapes' */
	i: number;
	/** connector */
	c: string;
}

export interface DiagramDataConnector {
	/** start */
	s: SerializeConnectorEnd,
	/** end */
	e: SerializeConnectorEnd
}