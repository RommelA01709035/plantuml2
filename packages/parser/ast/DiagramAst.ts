/**
 * Root node of the AST.
 */
export interface DiagramAst {
    readonly type: "Diagram";
    readonly statements: string[];
}