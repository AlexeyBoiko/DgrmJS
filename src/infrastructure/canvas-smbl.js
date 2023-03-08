export const CanvasSmbl = Symbol('Canvas');

/** @typedef { {x:number, y:number} } Point */
/** @typedef {{position:Point, scale:number, cell: number}} CanvasData */
/** @typedef {SVGGElement & { [CanvasSmbl]?: Canvas }} CanvasElement */
/**
@typedef {{
	move?(x:number, y:number, scale:number): void
	data: CanvasData

	// TODO: it is not infrastructure methods -> shouldn't be here
	selectClear?(): void
	shapeMap: Record<number, import("../shapes/shape-type-map").ShapeType>
}} Canvas
*/
