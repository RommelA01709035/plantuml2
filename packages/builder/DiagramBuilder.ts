import { Diagram, Node, Edge, Group } from "../core";
import { NodeBuilder } from "./NodeBuilder"
import { EdgeBuilder } from "./EdgeBuilder"
import { GroupBuilder } from "./GroupBuilder";

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

    constructor(id: string, name?: string){
        this.diagram = new Diagram(id, name);
    }

    node(id: string, name: string, kind?: string): NodeBuilder {
        const node = new Node(id, name, kind);
        this.diagram.addNode(node);
        return new NodeBuilder(this, node);
    }

    edge(id: string, sourceId: string, targetId: string): EdgeBuilder {
        const sourceNode = this.diagram.getNode(sourceId);
        const targetNode = this.diagram.getNode(targetId);

        if (!sourceNode) {
            throw new Error(`Source node with id "${sourceId}" does not exist.`);
        }
        if (!targetNode) {
            throw new Error(`Target node with id "${targetId}" does not exist.`);
        }

        const edge = new Edge(id, sourceId, targetId);
        this.diagram.addEdge(edge);
        return new EdgeBuilder(this, edge);
    }

    group(id: string, name: string, kind?: string): GroupBuilder {
        const group = new Group(id, name, kind);
        this.diagram.addGroup(group);
        return new GroupBuilder(this, group);
    }

    build(): Diagram {
        return this.diagram;
    }
}
