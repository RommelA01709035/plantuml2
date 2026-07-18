import { Label } from "../elements";

/**
 * Represents a connection between two nodes.
 *
 * @remarks
 * The semantics of the connection are defined by higher-level
 * packages (e.g. UML), while the core only models a generic edge.
 *
 * @public
 */
export class Edge {
    readonly id: string;
    readonly kind: string;
    readonly source: string;
    readonly target: string;
    label?: Label;

    constructor(
        id: string,
        source: string,
        target: string,
        kind: string = "default",
    ) {
        this.id = id;
        this.kind = kind;
        this.source = source;
        this.target = target;
    }
}