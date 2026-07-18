import { Label } from "../elements";
import { ModelElement } from "../ModelElement";

/**
 * Represents a connection between two nodes.
 *
 * @remarks
 * The semantics of the connection are defined by higher-level
 * packages (e.g. UML), while the core only models a generic edge.
 *
 * @public
 */
export class Edge extends ModelElement {
    readonly sourceId: string;
    readonly targetId: string;
    label?: Label;
    style?: string;

    constructor(
        id: string,
        source: string,
        target: string,
        kind: string = "default",
    ) {
        super(id, kind);
        this.sourceId = source;
        this.targetId = target;
    }
}