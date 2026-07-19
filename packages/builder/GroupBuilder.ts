import { Group, Node, Edge, DiagramElement } from "../core";
import type { Modifier } from "../modifiers/generic";
import type { BuilderContext } from "./interfaces"

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
export class GroupBuilder<TParent extends BuilderContext> implements BuilderContext {
    private readonly _parent: TParent;
    private readonly _group: Group;

    constructor(parent: TParent, group: Group) {
        this._parent = parent;
        this._group = group;
    }

    /** @internal */
    addNode(node: Node): void {
        this._group.addNode(node);
    }

    /** @internal */
    addGroup(group: Group): void {
        this._group.addGroup(group);
    }

    /** @internal */
    addEdge(edge: Edge): void {
        this._parent.addEdge(edge);
    }

    node(id: string, name: string, kind: string = "node", ...modifiers: Modifier<DiagramElement>[]): this {
        const node = new Node(id, name, kind);
        modifiers.forEach(modifier => modifier.apply(node));
        this._group.addNode(node);
        return this;
    }

    edge(id: string, sourceId: string, targetId: string): this {
        const edge = new Edge(id, sourceId, targetId);
        this.addEdge(edge);
        return this;
    }

    group(id: string, name: string, kind: string = "group", ...modifiers: Modifier<DiagramElement>[]): GroupBuilder<TParent> {
        const child = new Group(id, name, kind);
        modifiers.forEach(modifier => modifier.apply(child));
        this.addGroup(child);
        return new GroupBuilder(this._parent, child);
    }

    end(): TParent {
        return this._parent;
    }
}