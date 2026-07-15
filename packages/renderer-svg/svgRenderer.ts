import { Diagram } from "../core";
import { DiagramRenderer } from "./renderers/DiagramRenderer";

/**
 * Represents a renderer that generates SVG output for a given diagram.
 * 
 * @remarks
 * The SvgRenderer class is responsible for rendering a complete diagram into SVG format.
 * 
 * @public
 */
export class SvgRenderer {
    private readonly diagramRenderer = new DiagramRenderer();

    render(diagram: Diagram): string {
        return this.diagramRenderer.render(diagram);
    }
}