import { Diagram } from "../../../../../packages/core";
import { SvgRenderer } from "../../../../../packages/renderers/renderer-svg";

/**
 * Service for rendering diagrams
 * 
 * @remarks
 * This service provides methods for rendering diagrams into SVG format.
 * It can be extended to include additional rendering formats as needed.
 * 
 * @public
 */
export class RendererService {
    private readonly renderer = new SvgRenderer();

    render(diagram: Diagram): string {
        return this.renderer.render(diagram);
    }
}