/**
 * Props for the Editor component
 * 
 * @remarks
 * The Editor component is a controlled component that takes a value and an onChange callback.
 * The value prop is the current value of the editor, and the onChange prop is a callback that is called whenever the value changes.
 * 
 * @public
 */
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}