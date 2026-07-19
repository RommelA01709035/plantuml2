import { DiagramElement } from "../../core"
import type { Modifier } from "./Modifier";

class PositionModifier implements Modifier<DiagramElement> {
    private readonly x: number;
    private readonly y: number; 

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    
    apply(element: DiagramElement): void {
        element.setPosition(this.x, this.y);
    }
}

export function position(x: number, y: number): Modifier<DiagramElement> {
    return new PositionModifier(x, y);
}