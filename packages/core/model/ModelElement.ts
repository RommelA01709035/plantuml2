/**
 * Base class for all diagram base elements.
 * 
 * @remarks
 * Represents any base element that can be placed in a diagram.
 *
 * @public
 */
export abstract class ModelElement {
    readonly id: string;
    kind: string;

    constructor(id: string, kind: string = "default"){
        this.id = id;
        this.kind = kind;
    }
}