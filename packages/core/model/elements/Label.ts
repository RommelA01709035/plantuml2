import { DiagramElement } from "./DiagramElement";

/**
 * Represents a textual label in a diagram.
 *
 * @remarks
 * This class inherits from DiagramElement
 * Labels may belong to nodes, edges or groups.
 *
 * @public
 */
export class Label extends DiagramElement {
    text: string;

    constructor(id: string, text: string, kind: string = "label") {
        super(id, kind);
        this.text = text;
    }
}