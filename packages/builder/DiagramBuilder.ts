import { Diagram, Node, Edge, Group, DiagramElement } from "../core";
import { GroupBuilder } from "./GroupBuilder";
import type { Modifier } from "../modifiers/generic";
import type { BuilderContext } from "./interfaces";

/**
 * Builder class for constructing a Diagram object.
 * 
 * @remarks
 * This class provides a fluent interface for creating a Diagram and its associated Nodes.
 * It allows for the addition of nodes to the diagram and ultimately builds the complete Diagram object.
 * 
 * @public
 */
export class DiagramBuilder implements BuilderContext {
    private readonly diagram: Diagram;

    constructor(id: string, name?: string){
        this.diagram = new Diagram(id, name);
    }

    /** @internal */
    addNode(node: Node): void {
        this.diagram.addNode(node);
    }

    /** @internal */
    addGroup(group: Group): void {
        this.diagram.addGroup(group);
    }

    /** @internal */
    addEdge(edge: Edge): void {
        this.diagram.addEdge(edge);
    }

    node(id: string, name: string, kind: string = "node", ...modifiers: Modifier<DiagramElement>[]): this {
        const node = new Node(id, name, kind);
        modifiers.forEach(modifier => modifier.apply(node))
        this.diagram.addNode(node);
        return this;
    }

    edge(id: string, sourceId: string, targetId: string): this {
        if (!this.diagram.containsNode(sourceId)) {
            throw new Error(`Source node "${sourceId}" does not exist.`);
        }

        if (!this.diagram.containsNode(targetId)) {
            throw new Error(`Target node "${targetId}" does not exist.`);
        }

        const edge = new Edge(id, sourceId, targetId);
        this.diagram.addEdge(edge);
        return this;
    }

    group(id: string, name: string, kind: string = "group", ...modifiers: Modifier<DiagramElement>[]): GroupBuilder<DiagramBuilder> {
        const group = new Group(id, name, kind);
        modifiers.forEach(modifier => modifier.apply(group));
        this.diagram.addGroup(group);
        return new GroupBuilder(this, group);
    }

    build(): Diagram {
        return this.diagram;
    }
}
