import { Point, Size } from "../geometry";

/**
 * Base class for all diagram elements.
 * 
 * @remarks
 * Represents any element that can be placed in a diagram.
 *
 * @public
 */
export abstract class DiagramElement {
    readonly id: string;
    name: string;
    kind: string;

    protected position: Point;
    protected size: Size;
    protected visible: boolean;
    protected locked: boolean;

    constructor(id: string, name: string, kind: string = "element") {
        this.id = id;
        this.name = name;
        this.kind = kind;
        this.position = new Point()
        this.size = new Size()
        this.visible = true;
        this.locked = false;
    }

    getPosition(): Point {
        return this.position;
    }

    setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
    }

    getSize(): Size {
        return this.size;
    }

    setSize(width: number, height: number): void {
        this.size.width = width;
        this.size.height = height;
    }

    isVisible(): boolean {
        return this.visible;
    }

    setVisible(visible: boolean): void {
        this.visible = visible;
    }

    isLocked(): boolean {
        return this.locked;
    }

    setLocked(locked: boolean): void {
        this.locked = locked;
    }
}