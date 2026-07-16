import { Node } from "./Node";
import { Edge } from "./Edge";
import { Label } from "./Label";

/**
 * Represents a complete diagram.
 * 
 * @remarks
 * A diagram is the root object of the model and owns every
 * element that belongs to it.
 * 
 * @public
 */
export class Diagram {
    readonly id: string;
    name: string;
    private readonly _nodes: Node[];
    private readonly _edges: Edge[];
    private readonly _labels: Label[];

    constructor(id: string, name: string = "Untitled diagram"){
        this.id = id;
        this.name = name;
        this._nodes = [];
        this._edges = [];
        this._labels = [];
    } 

    /**
     * Adds a node to the diagram.
     * 
     * @param node - The node to be added to the diagram.
     */
    addNode(node: Node): void {
        this._nodes.push(node);
    }

    /**
     * Removes a Node from the diagram
     */
    removeNode(id: string): boolean {
        const index = this._nodes.findIndex(node => node.id === id);
        if(index === -1){
            return false;
        }
        this._nodes.splice(index, 1);
        return true;
    }

    /**
     * Returns a node by its identifier
     */
    getNode(id: string): Node | undefined {
        return this._nodes.find(node => node.id === id);
    }

    /**
     * Returns all nodes in the diagram. 
     */
    getNodes(): Node[] {
        return this._nodes;
    }

    /**
     * Adds an edge to the diagram
     * 
     * @param edge - The edge to be added to the diagram.
     */
    addEdge(edge: Edge): void {
        this._edges.push(edge);
    }

    /**
     * Removes an edge from the diagram
     * @param id - The identifier of the edge to be removed.
     * @returns True if the edge was removed, false otherwise.
     */
    removeEdge(id: string): boolean {
        const index = this._edges.findIndex(edge => edge.id === id);
        if(index === -1){
            return false;
        }
        this._edges.splice(index, 1);
        return true;
    }

    /**
     * Returns an edge by its identifier
     * @param id - The identifier of the edge to be retrieved.
     * @returns The edge if found, undefined otherwise.
     */
    getEdge(id: string): Edge | undefined {
        return this._edges.find(edge => edge.id === id);
    }

    /**
     * Returns all edges in the diagram.
     * @returns The array of edges.
     */
    getEdges(): Edge[] {
        return this._edges;
    }

    /**
     * Adds a label to the diagram.
     * @param label - The label to be added to the diagram.
     */
    addLabel(label: Label): void {
        this._labels.push(label);
    }

    /**
     * Removes a label from the diagram.
     * @param id - The identifier of the label to be removed.
     * @returns True if the label was removed, false otherwise.
     */
    removeLabel(id: string): boolean {
        const index = this._labels.findIndex(label => label.id === id);
        if(index === -1){
            return false;
        }
        this._labels.splice(index, 1);
        return true;
    }

    /**
     * Returns a label by its identifier.
     * @param id - The identifier of the label to be retrieved.
     * @returns The label if found, undefined otherwise.
     */
    getLabel(id: string): Label | undefined {
        return this._labels.find(label => label.id === id);
    }

    /**
     * Returns all labels in the diagram.
     * @returns The array of labels.
     */
    getLabels(): Label[] {
        return this._labels;
    }
}