import { Point } from "../geometry";

/**
 * Represents a textual label in a diagram.
 *
 * @remarks
 * Labels belong to model elements such as nodes,
 * edges or groups.
 *
 * @public
 */
export class Label {
    text: string;
    position: Point;
    style?: string;

    constructor(text: string, style?: string) {
        this.text = text;
        this.position = new Point();
        this.style = style;
    }
}