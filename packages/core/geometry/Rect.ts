import { Point } from "./Point";
import { Size } from "./Size";

/**
 * Represents a rectangle in 2D space defined by its position (top-left corner) and size (width and height).
 * @remarks
 * This class is part of the geometry module and can be used to define rectangular areas in a 2D coordinate system.
 *
 * @public
 */
export class Rect {
    position: Point;
    size: Size;

    constructor(position: Point = new Point(), size: Size = new Size()) {
        this.position = position;
        this.size = size;
    }

    get left(): number {
        return this.position.x;
    }

    get top(): number {
        return this.position.y;
    }

    get right(): number {
        return this.position.x + this.size.width;
    }

    get bottom(): number {
        return this.position.y + this.size.height;
    }

    contains(point: Point): boolean {
        return (
            point.x >= this.left &&
            point.x <= this.right &&
            point.y >= this.top &&
            point.y <= this.bottom
        );
    }

    intersects(other: Rect): boolean {
        return !(
            other.left > this.right ||
            other.right < this.left ||
            other.top > this.bottom ||
            other.bottom < this.top
        );
    }
}