type DiagramEventType = 'select' | 'move';

interface DiagramShapeUpdateParam extends PresenterShapeUpdateParam {
	shape?: IPresenterShape;
	selector?: string;
}

interface DiagramShapeDelParam {
	shape?: IPresenterShape;
	selector?: string;
}