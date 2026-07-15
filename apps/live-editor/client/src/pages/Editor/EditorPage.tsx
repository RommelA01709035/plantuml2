import "./EditorPage.css";

import { Toolbar } from "../../components/Toolbar";
import { Sidebar } from "../../components/Sidebar";
import { DiagramCanvas } from "../../components/DiagramCanvas";
import { PropertiesPanel } from "../../components/PropertiesPanel";
import { StatusBar } from "../../components/StatusBar";

import { DocumentService } from "../../services";

const documentService = new DocumentService();

export function EditorPage() {

    const diagram = documentService.createExampleDiagram();

    return (
        <div className="editor">

            <Toolbar />

            <main className="editor-main">

                <Sidebar />

                <DiagramCanvas
                    diagram={diagram}
                />

                <PropertiesPanel />

            </main>

            <StatusBar />

        </div>
    );
}