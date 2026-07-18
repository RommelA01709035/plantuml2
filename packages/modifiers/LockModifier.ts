import { Node } from "../core";
import { Modifier } from "./Modifier";

export class LockModifier implements Modifier<Node> {
    private readonly locked: boolean;
    constructor(locked: boolean) {
        this.locked = locked;
    }

    apply(node: Node): void {
        node.setLocked(this.locked);
    }
}

export function lock(): Modifier<Node> {
    return new LockModifier(true);
}

export function unlock(): Modifier<Node> {
    return new LockModifier(false);
}