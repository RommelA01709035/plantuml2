import "./EditorPage.css";

import { useMemo, useState } from "react";
import { DiagramCanvas } from "../../components/DiagramCanvas";
import { Editor } from "../../components/Editor";
import { EditorService, RendererService } from "../../services";

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
    const [source, setSource] = useState(`User.node("MyNode", "User", "actor").build()`);

    const editorService = useMemo(() => new EditorService(), []);

    const rendererService = useMemo(() => new RendererService(), []);

    /**
     * Result generated from the current source.
     */
    const editorResult = useMemo(() => {
        return editorService.updateSource(source);
    }, [source, editorService]);

    const svg = useMemo(() => {
        if (!editorResult.diagram) {
            return "";
        }
        return rendererService.render(editorResult.diagram);
    }, [editorResult.diagram, rendererService]);

    return (
        <main className="editor-page">

            <Editor
                value={source}
                onChange={setSource}
            />

            <DiagramCanvas svg={svg} />

        </main>
    );
}