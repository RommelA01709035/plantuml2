import { DiagramElement } from "./DiagramElement";

/**
 * Represents a group of elements in a diagram.
 * @remarks
 * This class inherits from DiagramElement class and 
 * is part of the model module and can be used to define groups of elements in a diagram.
 *
 * @public
 */
export class Group extends DiagramElement {
    name: string;
    private readonly _nodeIds: string[];
    private readonly _groupIds: string[];

    constructor(id: string, name: string = "Untitled group", kind: string = "default") {
        super(id, kind);
        this.name = name;
        this._nodeIds = [];
        this._groupIds = [];
    }

    /**
     * Gets the IDs of the nodes in the group.
     * @returns An array of node IDs.
     */
    getNodeIds(): readonly string[] {
        return [...this._nodeIds];
    }

    /**
     * Adds a node ID to the group.
     * @param nodeId - The ID of the node to be added to the group.
     */
    attachNode(nodeId: string): void {
        if (!this._nodeIds.includes(nodeId)) {
            this._nodeIds.push(nodeId);
        }
    }
    
    /**
     * Removes a node ID from the group.
     * @param nodeId - The ID of the node to be removed from the group.
     */
    detachNode(nodeId: string): boolean {
        const index = this._nodeIds.indexOf(nodeId);
        if (index === -1) {
            return false;
        }
        this._nodeIds.splice(index, 1);
        return true;
    }

    /**
     * Gets the IDs of the groups in the group.
     * @returns An array of group IDs.
     */
    getGroupIds(): readonly string[] {
        return [...this._groupIds];
    }

    /**
     * Adds a group ID to the group.
     * @param groupId - The ID of the group to be added to the group.
     * @remarks
     * This method allows for the creation of nested groups by adding a group ID to another group.
     * If the group ID already exists in the group, it will not be added again.
     */
    attachGroup(groupId: string): void {
        if (!this._groupIds.includes(groupId)) {
            this._groupIds.push(groupId);
        }
    }

    /**
     * Removes a group ID from the group.
     * @param groupId - The ID of the group to be removed from the group.
     * @returns True if the group ID was removed, false otherwise.
     */
    detachGroup(groupId: string): boolean {
        const index = this._groupIds.indexOf(groupId);
        if (index === -1) {
            return false;
        }
        this._groupIds.splice(index, 1);
        return true;
    }
}