import { Node, Group, Edge } from "../../core";

/**
 * Interface that represents a builder parent
 */
export interface BuilderContext {
    addNode(node: Node): void;
    addGroup(group: Group): void;
    addEdge(edge: Edge): void;
}