/**
 * Represents a point in 2D space with x and y coordinates.
 * 
 * @remarks
 * This class is part of the geometry module and can be used to define points in a 2D coordinate system.
 * 
 * @public
 */
export class Point {
    public x: number = 0;
    public y: number = 0;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}