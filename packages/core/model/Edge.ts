import { Label } from "./Label";
import { DiagramElement } from "./DiagramElement";

/**
 * Represents a connection between two nodes.
 *
 * @remarks
 * The semantics of the connection are defined by higher-level
 * packages (e.g. UML), while the core only models a generic edge.
 *
 * @public
 */
export class Edge extends DiagramElement {
    readonly source: string;
    readonly target: string;
    label?: Label;

    constructor(
        id: string,
        source: string,
        target: string,
        kind: string = "default",
    ) {
        super(id, kind);
        this.source = source;
        this.target = target;
    }
}