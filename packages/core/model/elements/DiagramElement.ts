import { Point, Size } from "../../geometry";
import { ModelElement } from "../ModelElement";

/**
 * Base class for all diagram elements.
 * 
 * @remarks
 * Represents any element that can be placed in a diagram.
 *
 * @public
 */
export abstract class DiagramElement extends ModelElement {
    protected position: Point;
    protected size: Size;
    protected visible: boolean;
    protected locked: boolean;

    constructor(id: string, kind: string = "element") {
        super(id, kind);
        this.position = new Point()
        this.size = new Size()
        this.visible = true;
        this.locked = false;
    }

    getPosition(): Point {
        return new Point(this.position.x, this.position.y);
    }

    setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
    }

    getSize(): Size {
        return new Size(this.size.width, this.size.height);
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