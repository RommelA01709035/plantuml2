import { Node } from "./Node";

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

    constructor(id: string, name: string = "Untitled diagram"){
        this.id = id;
        this.name = name;
        this._nodes = [];
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
}