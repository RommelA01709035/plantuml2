import { Node } from "../core"
import { Modifier } from "./Modifier";

class PositionModifier implements Modifier<Node> {
    private readonly x: number;
    private readonly y: number; 

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    
    apply(node: Node): void {
        node.setPosition(this.x, this.y);
    }
}

export function position(x: number, y: number): Modifier<Node> {
    return new PositionModifier(x, y);
}