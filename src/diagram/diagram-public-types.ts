type DiagramEventType = 'select';
interface IDiagramEventDetail {
	target: IPresenterShape;
}

interface DiagramShapeUpdateParam extends PresenterShapeUpdateParam {
	shape?: IPresenterShape;
	selector?: string;
}

interface DiagramShapeDelParam {
	shape?: IPresenterShape;
	selector?: string;
}