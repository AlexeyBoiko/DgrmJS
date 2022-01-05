type DiagramEventType = 'select' | 'move';

interface DiagramShapeUpdateParam extends PresenterElementUpdateParam {
	shape?: IPresenterElement;
	selector?: string;
}

interface DiagramShapeDelParam {
	shape?: IPresenterElement;
	selector?: string;
}