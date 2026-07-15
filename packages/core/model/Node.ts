import { Point, Size } from '../geometry';

/**
 * Represents a node in a diagram with an identifier, name, kind, position, and size.
 * 
 * @remarks
 * This class is part of the core model module and can be used to define nodes in a diagram.
 * 
 * @public
 */
export class Node {
    readonly id: string;
    name: string;
    label?: string;
    kind: string;
    position: Point;
    size: Size;

    constructor(id: string, name: string, kind: string = "node") {
        this.id = id;
        this.name = name;
        this.kind = kind;
        this.position = new Point();
        this.size = new Size();
    }
}