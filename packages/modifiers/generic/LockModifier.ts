import { DiagramElement } from "../../core";
import type { Modifier } from "./Modifier";

class LockModifier implements Modifier<DiagramElement> {
    private readonly locked: boolean;

    constructor(locked: boolean) {
        this.locked = locked;
    }

    apply(element: DiagramElement): void {
        element.setLocked(this.locked);
    }
}

export function lock(): Modifier<DiagramElement> {
    return new LockModifier(true);
}

export function unlock(): Modifier<DiagramElement> {
    return new LockModifier(false);
}