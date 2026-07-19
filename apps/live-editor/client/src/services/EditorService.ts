import { Interpreter } from "../../../../../packages/interpreter";
import type { EditorResult } from "./types/EditorResult";

/**
 * Service responsible for managing the editor state and interactions.
 *
 * @remarks
 * This service provides methods to update the source code in the editor.
 * This class can be extended in the future to include more functionalities related to the editor, such as layout management, undo/redo operations, and more.
 *
 * @public
 */
export class EditorService {
    private readonly interpreter: Interpreter;

    constructor() {
        this.interpreter = new Interpreter();
    }

    /**
     * Updates the source code in the editor and builds a diagram.
     *
     * @param source - The source code for the diagram.
     * @returns The built diagram.
     */
    updateSource(source: string): EditorResult {
        try {
            return {
                diagram: this.interpreter.parse(source),
                errors: []
            };
        } catch (error) {
            return {
                diagram: null,
                errors: [error as Error]
            };
        }
    }
}