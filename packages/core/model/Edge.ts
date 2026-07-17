import { Label } from "./Label";

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
    readonly source: string;
    readonly target: string;
    kind: string;
    label?: Label;
    visible: boolean = true;
    locked: boolean = false;

    constructor(
        id: string,
        source: string,
        target: string,
    ) {
        this.id = id;
        this.source = source;
        this.target = target;
        this.kind = "default";
    }
}