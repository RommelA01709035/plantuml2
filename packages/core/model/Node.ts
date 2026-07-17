import { Point, Size } from '../geometry';
import { Label } from './Label';

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
    kind: string;
    label?: Label;
    position: Point;
    size: Size;
    visible: boolean = true;
    locked: boolean = false;

    constructor(id: string, name: string, kind: string = "node") {
        this.id = id;
        this.name = name;
        this.kind = kind;
        this.position = new Point();
        this.size = new Size();
    }

    /**
     * Sets the position of the node.
     */
    setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
    }

    /**
     * Sets the size of the node.
     */
    setSize(width: number, height: number): void {
        this.size.width = width;
        this.size.height = height;
    }
}