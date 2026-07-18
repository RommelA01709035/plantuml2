import { Point, Size } from "../../geometry";

/**
 * Represents a port of a node in a diagram.
 * @remarks
 * This class is part of the model module and can be used to define ports for nodes in a diagram.
 *
 * @public
 */
export class Port {
    readonly id: string;
    name: string;
    kind: string;
    position: Point;
    size: Size;
    visible: boolean;
    nodeId: string;

    constructor(id: string, nodeId: string, name: string = "Untitled port", kind: string = "default") {
        this.id = id;
        this.name = name;
        this.kind = kind;
        this.position = new Point();
        this.size = new Size();
        this.visible = true;
        this.nodeId = nodeId;
    }
}