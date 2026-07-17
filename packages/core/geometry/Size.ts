/**
 * Represents the size of a 2D object with width and height.
 * 
 * @remarks
 * This class is part of the geometry module and can be used to define the dimensions of objects in a 2D space.
 * 
 * @public
 */
export class Size {
    public width: number;
    public height: number;

    constructor(width: number = 120, height: number = 60) {
        this.width = width;
        this.height = height;
    }
}