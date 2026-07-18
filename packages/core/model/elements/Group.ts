import { DiagramElement } from "./DiagramElement";
import { Node } from "./Node";

/**
 * Represents a group of elements in a diagram.
 * @remarks
 * A group is a container that can own nodes and other groups.
 *
 * @public
 */
export class Group extends DiagramElement {
    name: string;
    private readonly _nodes: Node[];
    private readonly _groups: Group[];

    constructor(id: string, name: string = "Untitled group", kind: string = "default") {
        super(id, kind);
        this.name = name;
        this._nodes = [];
        this._groups = [];
    }

    /**
     * Returns all nodes contained in the group.
     */
    getNodes(): readonly Node[] {
        return [...this._nodes];
    }

    /**
     * Returns a node by its identifier.
     */
    getNode(id: string): Node | undefined {
        return this._nodes.find(
            node => node.id === id
        );
    }

    /**
     * Adds a node to the group.
     */
    addNode(node: Node): void {
        this._nodes.push(node);
    }
    
    /**
     * Removes a node from the group.
     */
    removeNode(id: string): boolean {
        const index = this._nodes.findIndex(
            node => node.id === id
        );

        if(index === -1){
            return false;
        }

        this._nodes.splice(index,1);
        return true;
    }

    /**
     * Returns child groups.
     */
    getGroups(): readonly Group[] {
        return [...this._groups];
    }

    /**
     * Returns a child group.
     */
    getGroup(id: string): Group | undefined {
        return this._groups.find(
            group => group.id === id
        );
    }

    /**
     * Adds a child group.
     */
    addGroup(group: Group): void {
        this._groups.push(group);
    }

    /**
     * Removes a child group.
     */
    removeGroup(id: string): boolean {
        const index = this._groups.findIndex(
            group => group.id === id
        );

        if(index === -1){
            return false;
        }

        this._groups.splice(index,1);
        return true;
    }
}