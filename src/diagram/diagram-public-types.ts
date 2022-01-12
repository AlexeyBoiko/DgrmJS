type DiagramEventType = 'select' | 'move';
interface IDiagramEventDetail {
	target: IPresenterElement;
}

interface DiagramShapeUpdateParam extends PresenterShapeUpdateParam {
	shape?: IPresenterShape;
	selector?: string;
}

interface DiagramShapeDelParam {
	shape?: IPresenterShape;
	selector?: string;
}