import { Label } from './Label';
import { DiagramElement } from "./DiagramElement"

/**
 * Represents a node in a diagram with an identifier, name, kind, position, and size.
 * 
 * @remarks
 * This class is part of the core model module and can be used to define nodes in a diagram.
 * 
 * @public
 */
export class Node extends DiagramElement {
    label?: Label;
    constructor(id: string, name: string, kind: string = "node") {
        super(id, name, kind)
    }
}