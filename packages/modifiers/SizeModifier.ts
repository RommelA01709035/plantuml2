import { Node } from "../core";
import { Modifier } from "./Modifier";

class SizeModifier implements Modifier<Node> {
    private readonly width: number;
    private readonly height: number;

    constructor(width: number, height: number){
        this.width = width;
        this.height = height;
    }

    apply(node: Node): void {
        node.setSize(this.width, this.height);
    }
}

export function size(width: number, height: number): Modifier<Node> {
    return new SizeModifier(width, height);
}