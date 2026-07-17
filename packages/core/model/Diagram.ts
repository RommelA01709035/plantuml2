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

    get nodeCount(): number {
        return this._nodes.length;
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
     * 
     * @remarks
     * This method removes a node from the diagram by its identifier.
     * It also removes any edges that are connected to the node being removed.
     * 
     * @param id - The identifier of the node to be removed.
     * @returns True if the node was removed, false otherwise.
     */
    removeNode(id: string): boolean {
        const index = this._nodes.findIndex(node => node.id === id);
        if(index === -1){
            return false;
        }
        this._nodes.splice(index, 1);

        for (let i = this._edges.length - 1; i >= 0; i--) {
            const edge = this._edges[i];
            if (
                edge.source === id ||
                edge.target === id
            ) {
                this._edges.splice(i, 1);
            }
        }
        return true;
    }

    /**
     * Checks if the diagram contains a node with the specified ID.
     * @param id - The ID of the node to check for.
     * @returns True if the node exists, false otherwise.
     */
    containsNode(id: string): boolean {
        return this._nodes.some(node => node.id === id);
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
     * Adds an edge to the diagram
     * 
     * @param edge - The edge to be added to the diagram.
     */
    addEdge(edge: Edge): void {
        this._edges.push(edge);
    }

    get edgeCount(): number {
        return this._edges.length;
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
     * Checks if the diagram contains an edge with the specified ID.
     * @param id - The ID of the edge to check for.
     * @returns True if the edge exists, false otherwise.
     */
    containsEdge(id: string): boolean {
        return this._edges.some(edge => edge.id === id);
    }

    /**
     * Returns all edges connected to a specific node.
     * @param nodeId - The ID of the node.
     * @returns The array of edges connected to the node.
     */
    findEdges(nodeId: string): Edge[] {
        return this._edges.filter(
            edge => edge.source === nodeId || 
            edge.target === nodeId
        );
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

    get labelCount(): number {
        return this._labels.length;
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
     * Checks if the diagram contains a label with the specified ID.
     * @param id - The ID of the label to check for.
     * @returns True if the label exists, false otherwise.
     */
    containsLabel(id: string): boolean {
        return this._labels.some(label => label.id === id);
    }

    /**
     * Clears the diagram by removing all nodes, edges, and labels.
     */
    clear(): void {
        this._nodes.length = 0;
        this._edges.length = 0;
        this._labels.length = 0;
    }
}