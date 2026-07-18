export abstract class ModelElement {
    readonly id: string;
    kind: string;

    constructor(id: string, kind: string = "default"){
        this.id = id;
        this.kind = kind;
    }
}