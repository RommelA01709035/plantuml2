import { Group, Node } from "../core";
import type { Modifier } from "../modifiers/generic";
import { DiagramBuilder } from "./DiagramBuilder";

/**
 * Builder class for constructing a Group object.
 * 
 * @remarks
 * This class provides a fluent interface for creating a Group and its associated properties.
 * It allows for the configuration of the group's name and ultimately returns to the DiagramBuilder.
 * A GroupBuilder is used to build the contents of a group.
 * Nodes and child groups belong to the group, while edges are
 * always owned by the diagram.
 * 
 * @public
 */
export class GroupBuilder {
    private readonly _parent: DiagramBuilder;
    private readonly _group: Group;

    constructor(parent: DiagramBuilder, group: Group) {
        this._parent = parent;
        this._group = group;
    }

    node(id: string, name: string, kind: string = "node", ...modifiers: Modifier<Node>[]): this {
        const node = new Node(id, name, kind);
        modifiers.forEach(m => m.apply(node));
        this._group.addNode(node);
        return this;
    }

    group(id: string, name: string, kind: string = "group", ...modifiers: Modifier<Group>[]): GroupBuilder {
        const child = new Group(id, name, kind);
        modifiers.forEach(m => m.apply(child));
        this._group.addGroup(child);
        return new GroupBuilder(this._parent, child);
    }

    end(): DiagramBuilder {
        return this._parent;
    }
}