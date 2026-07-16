import "./EditorPage.css";

import { useMemo, useState } from "react";
import { DiagramCanvas } from "../../components/DiagramCanvas";
import { Editor } from "../../components/Editor";
import { EditorService } from "../../services/EditorService";

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
    const editorService = useMemo(() => new EditorService(), []);

    /**
     * Diagram generated from the current source.
     */
    const diagram = useMemo(() => {
        try {
            return editorService.updateSource(source);
        } catch (error) {
            console.error("Error parsing source code:", error);
            return null;
        }
    }, [source, editorService]);

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