import { Node } from "../core";
import { DiagramBuilder } from "./DiagramBuilder";

/**
 * Builder class for constructing a Node object within a Diagram.
 * 
 * @remarks
 * This class provides a fluent interface for configuring a Node's properties such as position and size.
 * It allows for chaining method calls to set up the Node before returning to the DiagramBuilder context.
 * 
 * @public
 */
export class NodeBuilder {
    constructor(
        private readonly diagramBuilder: DiagramBuilder,
        private readonly node: Node
    ) {}

    position(x: number, y: number): this {
        this.node.setPosition(x, y);
        return this;
    }    

    size(width: number, height: number): this {
        this.node.setSize(width, height);
        return this;
    }

    end(): DiagramBuilder {
        return this.diagramBuilder;
    }
}