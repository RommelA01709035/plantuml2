import { DiagramElement } from "../../core";
import type { Modifier } from "./Modifier";

class SizeModifier implements Modifier<DiagramElement> {
    private readonly width: number;
    private readonly height: number;

    constructor(width: number, height: number){
        this.width = width;
        this.height = height;
    }

    apply(element: DiagramElement): void {
        element.setSize(this.width, this.height);
    }
}

export function size(width: number, height: number): Modifier<DiagramElement> {
    return new SizeModifier(width, height);
}