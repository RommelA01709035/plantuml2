import { Diagram } from "../../../../../packages/core";
import { Parser } from "../../../../../packages/parser";

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
    private readonly parser: Parser;
    
    constructor() {
        this.parser = new Parser();
    }

    /**
     * Updates the source code in the editor and builds a diagram.
     *
     * @param source - The source code for the diagram.
     * @returns The built diagram.
     */
    updateSource(source: string): Diagram {
        return this.parser.parse(source);
    }
}