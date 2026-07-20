import { Node, Group } from "./elements";
import { Edge } from "./connection";

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
    private readonly _groups: Group[];

    constructor(id: string, name: string = "Untitled diagram"){
        this.id = id;
        this.name = name;
        this._nodes = [];
        this._edges = [];
        this._groups = [];
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
    getNodes(): readonly Node[] {
        return [...this._nodes];
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
                edge.sourceId === id ||
                edge.targetId === id
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
    getEdges(): readonly Edge[] {
        return [...this._edges];
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
            edge => edge.sourceId === nodeId || 
            edge.targetId === nodeId
        );
    }
    /**
     * Returns a group by its identifier.
     * @param id - The identifier of the group to be retrieved.
     * @returns The group if found, undefined otherwise.
     */
    getGroup(id: string): Group | undefined {
        return this._groups.find(group => group.id === id);
    }

    /**
     * Returns all groups in the diagram.
     * @returns The array of groups.
     */
    getGroups(): readonly Group[] {
        return [...this._groups];
    }

    /**
     * Returns the number of groups in the diagram.
     * @returns The number of groups in the diagram.
     */
    get groupCount(): number {
        return this._groups.length;
    }

    /**
     * Adds a group to the diagram.
     * @param group - The group to be added to the diagram.
     */
    addGroup(group: Group): void {
        this._groups.push(group);
    }

    /**
     * Removes a group from the diagram.
     * @param id - The ID of the group to be removed.
     * @returns True if the group was removed, false otherwise.
     */
    removeGroup(id: string): boolean {
        const index = this._groups.findIndex(group => group.id === id);
        if(index === -1){
            return false;
        }
        this._groups.splice(index, 1);
        return true;
    }

    /**
     * Checks if the diagram contains a group with the specified ID.
     * @param id - The ID of the group to check for.
     * @returns True if the group exists, false otherwise.
     */
    containsGroup(id: string): boolean {
        return this._groups.some(group => group.id === id);
    }

    /**
     * Clears the diagram by removing all nodes, edges, and labels.
     */
    clear(): void {
        this._nodes.length = 0;
        this._edges.length = 0;
        this._groups.length = 0;
    }
}