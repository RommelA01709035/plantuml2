import { Group } from "../core";
import { DiagramBuilder } from "./DiagramBuilder";

/**
 * Builder class for constructing a Group object.
 * @remarks
 * This class provides a fluent interface for creating a Group and its associated properties.
 * It allows for the configuration of the group's name and ultimately returns to the DiagramBuilder.
 * 
 * @public
 */
export class GroupBuilder {
    private readonly diagramBuilder: DiagramBuilder;
    private readonly group: Group;

    constructor(diagramBuilder: DiagramBuilder, group: Group) {
        this.diagramBuilder = diagramBuilder;
        this.group = group;
    }

    position(x: number, y: number): this {
        this.group.setPosition(x, y);
        return this;
    }

    size(width: number, height: number): this {
        this.group.setSize(width, height);
        return this;
    }

    show(): this {
        this.group.setVisible(true);
        return this;
    }

    hide(): this {
        this.group.setVisible(false);
        return this;
    }

    lock(): this {
        this.group.setLocked(true);
        return this;
    }

    unlock(): this {
        this.group.setLocked(false);
        return this;
    }

    attachNode(nodeId: string): this {
        this.group.attachNode(nodeId);
        return this;
    }

    detachNode(nodeId: string): this {
        this.group.detachNode(nodeId);
        return this;
    }

    attachGroup(groupId: string): this {
        this.group.attachGroup(groupId);
        return this;
    }

    detachGroup(groupId: string): this {
        this.group.detachGroup(groupId);
        return this;
    }

    end(): DiagramBuilder {
        return this.diagramBuilder;
    }
}