import { Edge, Label } from "../core";
import { DiagramBuilder } from "./DiagramBuilder";

export class EdgeBuilder {
    private readonly diagramBuilder: DiagramBuilder;
    private readonly edge: Edge;

    constructor(diagramBuilder: DiagramBuilder, edge: Edge) {
        this.diagramBuilder = diagramBuilder;
        this.edge = edge;
    }

    kind(kind: string): this {
        this.edge.kind = kind;
        return this;
    }

    label(text: string): this {
        this.edge.label = new Label(`${this.edge.id}-label`, text);
        return this;
    }

    end(): DiagramBuilder {
        return this.diagramBuilder;
    }
}