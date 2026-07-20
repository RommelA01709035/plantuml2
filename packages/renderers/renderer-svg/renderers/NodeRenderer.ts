import { Node } from "../../../core";

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

        if (!node.isVisible()) {
            return "";
        }
        return `
        <g id="${node.id}">
            <rect
            x="${node.getPosition().x}"
            y="${node.getPosition().y}"
            width="${node.getSize().width}"
            height="${node.getSize().height}"
            fill="white"
            stroke="black"
            />

            <text
                x="${node.getPosition().x + 10}"
                y="${node.getPosition().y + 25}"
            >
                ${node.name ?? ""}
            </text>
        </g>
        `;
    }
}