import { Node } from "../core";
import { Modifier } from "./Modifier";

export class VisibilityModifier implements Modifier<Node> {
    private readonly visible: boolean;
    constructor(visible: boolean) {
        this.visible = visible;
    }

    apply(node: Node): void {
        node.setVisible(this.visible);
    }
}

export function show(): Modifier<Node> {
    return new VisibilityModifier(true);
}

export function hide(): Modifier<Node> {
    return new VisibilityModifier(false);
}