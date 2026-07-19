import { Node, Group, Edge } from "../../core";

export interface BuilderContext {
    addNode(node : Node): void;
    addGroup(group : Group): void;
    addEdge(edge : Edge): void;
}