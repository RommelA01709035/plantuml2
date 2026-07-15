import { Node } from "../core";
import { DiagramBuilder } from "./DiagramBuilder";

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