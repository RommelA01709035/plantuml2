import { DiagramElement } from "../../core";
import type { Modifier } from "./Modifier";

export class VisibilityModifier implements Modifier<DiagramElement> {
    private readonly visible: boolean;

    constructor(visible: boolean) {
        this.visible = visible;
    }

    apply(element: DiagramElement): void {
        element.setVisible(this.visible);
    }
}

export function show(): Modifier<DiagramElement> {
    return new VisibilityModifier(true);
}

export function hide(): Modifier<DiagramElement> {
    return new VisibilityModifier(false);
}