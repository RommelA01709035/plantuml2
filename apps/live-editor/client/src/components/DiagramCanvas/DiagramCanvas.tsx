import "./DiagramCanvas.css";
import { Diagram } from "../../../../../../packages/core";
import { SvgRenderer } from "../../../../../../packages/renderers/renderer-svg";

interface DiagramCanvasProps {
    diagram: Diagram;
}

const renderer = new SvgRenderer();

export function DiagramCanvas({ diagram }: DiagramCanvasProps) {
    const svgContent = renderer.render(diagram);
    
    return (
        <section className="canvas">

            <div
                dangerouslySetInnerHTML={{
                    __html: svgContent
                }}
            />

        </section>
    );
}