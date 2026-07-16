import "./EditorPage.css";

import { useMemo, useState } from "react";
import { DiagramCanvas } from "../../components/DiagramCanvas";
import { Editor } from "../../components/Editor";
import { Parser } from "../../../../../../packages/parser";

/**
 * Main page of the Live editor.
 * 
 * @remarks
 * This component coordinates the editor and the canvas.
 *
 * @public
 */
export function EditorPage() {
    /**
     * Source code written by the user.
     */
    const [source, setSource] = useState(`User Product Order`);

    /**
     * Single parser instance.
     */
    const parser = useMemo(() => new Parser(), []);

    /**
     * Diagram generated from the current source.
     */
    const diagram = useMemo(() => {
        try {
            return parser.parse(source);
        } catch (error) {
            console.error("Error parsing source code:", error);
            return null;
        }
    }, [source, parser]);

    return (
        <main className="editor-page">

            <Editor
                value={source}
                onChange={setSource}
            />

            {diagram ? (
                <DiagramCanvas
                    diagram={diagram}
                />
            ) : null}

        </main>
    );
}