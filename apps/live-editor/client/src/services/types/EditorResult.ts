import { Diagram } from "../../../../../../packages/core";

/**
 * Result produced by the editor pipeline.
 *
 * @remarks
 * Besides the generated diagram, it also contains
 * diagnostics produced while processing the source code.
 *
 * @public
 */
export interface EditorResult {

    /**
     * Generated diagram.
     */
    diagram: Diagram | null;

    /**
     * Processing errors.
     */
    errors: Error[];

}