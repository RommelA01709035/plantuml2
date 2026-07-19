import { Edge } from "../core";
import { Label } from "../core/model";
import { DiagramBuilder } from "./DiagramBuilder";

/**
 * Builder class for constructing an Edge object.
 * 
 * @remarks
 * This class provides a fluent interface for creating an Edge and its associated properties.
 * It allows for the configuration of the edge's kind and label, and ultimately returns to the DiagramBuilder.
 * 
 * @public
 */
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