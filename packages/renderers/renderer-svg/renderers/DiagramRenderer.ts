import { Diagram } from "../../core";
import { NodeRenderer } from "./NodeRenderer";

/**
 * Represents a renderer that generates SVG output for a given diagram.
 * 
 * @remarks
 * The DiagramRenderer class is responsible for rendering a complete diagram into SVG format.
 * 
 * @public
 */
export class DiagramRenderer {
    private readonly nodeRenderer = new NodeRenderer();

    render(diagram: Diagram): string {
        const nodes = diagram.getNodes().map(node => this.nodeRenderer.render(node)).join("\n");

        return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            ${nodes}
        </svg>`;
    }
}