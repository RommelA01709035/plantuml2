import { Point } from "../geometry";

/**
 * Represents a textual label in a diagram.
 *
 * @remarks
 * Labels may belong to nodes, edges or groups.
 *
 * @public
 */
export class Label {
    readonly id: string;
    text: string;
    position: Point;
    visible: boolean;

    constructor(
        id: string,
        text: string
    ) {
        this.id = id;
        this.text = text;
        this.position = new Point();
        this.visible = true;
    }
}