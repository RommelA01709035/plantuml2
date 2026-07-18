import "./DiagramCanvas.css";

interface DiagramCanvasProps {
    svg: string;
}

export function DiagramCanvas({ svg }: DiagramCanvasProps) {
    return (
        <section className="canvas">
            <div
                dangerouslySetInnerHTML={{
                    __html: svg
                }}
            />
        </section>
    );
}