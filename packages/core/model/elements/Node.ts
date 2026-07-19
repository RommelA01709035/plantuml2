import { Label } from './Label';
import { DiagramElement } from "./DiagramElement"

/**
 * Represents a node in a diagram with a label
 * 
 * @remarks
 * This class inherits from DiagramElement class and 
 * is part of the core model module and can be used to define nodes in a diagram.
 * 
 * @public
 */
export class Node extends DiagramElement {
    name: string;
    label?: Label;

    constructor(id: string, name: string, kind: string = "node") {
        super(id, kind);
        this.name = name;
    }
}