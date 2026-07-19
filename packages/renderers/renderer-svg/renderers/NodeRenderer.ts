import { Node } from "../../core";

/**
 * Represents a renderer that generates SVG output for a given node.
 * 
 * @remarks
 * The NodeRenderer class is responsible for rendering individual nodes into SVG format.
 * 
 * @public
 */
export class NodeRenderer {
    render(node: Node): string {

        if (!node.visible) {
            return "";
        }
        return `
        <g id="${node.id}">
            <rect
            x="${node.position.x}"
            y="${node.position.y}"
            width="${node.size.width}"
            height="${node.size.height}"
            fill="white"
            stroke="black"
            />

            <text
                x="${node.position.x + 10}"
                y="${node.position.y + 25}"
            >
                ${node.name ?? ""}
            </text>
        </g>
        `;
    }
}