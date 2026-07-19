import "./Editor.css";

/**
 * Props for the Editor component
 * 
 * @remarks
 * The Editor is a controlled component. It displays the current
 * source code and notifies its parent whenever the content changes.
 * 
 * @public
 */
interface EditorProps {
  /**
  * Current source code.
  */
  value: string;

  /**
  * Called whenever the editor content changes.
  */
  onChange: (value: string) => void;
}

/**
 * Source code editor.
 *
 * @remarks
 * This implementation uses a simple HTML textarea.
 * It can later be replaced by Monaco Editor or CodeMirror
 * without affecting the rest of the application.
 *
 * @public
 */
export function Editor({ value, onChange }: EditorProps) {
  return (
    <section className="editor-panel">

      <header className="editor-header">
          Source
      </header>

      <textarea
          className="editor-textarea"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`User.node("My Node")\nProduct.node("My Product")`}
      />

    </section>
  );
}