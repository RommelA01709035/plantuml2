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
     * Result generated from the current source.
     */
    const editorResult = useMemo(() => {
        return editorService.updateSource(source);
    }, [source, editorService]);

    return (
        <main className="editor-page">

            <Editor
                value={source}
                onChange={setSource}
            />

            {editorResult.diagram && (
                <DiagramCanvas
                    diagram={editorResult.diagram}
                />
            )}

        </main>
    );
}