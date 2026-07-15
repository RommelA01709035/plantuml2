import { Diagram, Node } from "../core";
import { NodeBuilder } from "./NodeBuilder"

/**
 * Builder class for constructing a Diagram object.
 * 
 * @remarks
 * This class provides a fluent interface for creating a Diagram and its associated Nodes.
 * It allows for the addition of nodes to the diagram and ultimately builds the complete Diagram object.
 * 
 * @public
 */
export class DiagramBuilder {
    private readonly diagram: Diagram;

    constructor(id: string, name: string = "Untitled diagram"){
        this.diagram = new Diagram(id, name);
    }

    node(id: string, name: string, kind: string = "node"): NodeBuilder {
        const node = new Node(id, name, kind);
        this.diagram.addNode(node);
        return new NodeBuilder(this, node);
    }

    build(): Diagram {
        return this.diagram;
    }
}