import { Diagram } from "../../../../../packages/core";
import { DiagramBuilder } from "../../../../../packages/builder";

/**
 * Service for managing documents and diagrams
 * 
 * @remarks
 * This service provides methods for creating and managing documents and diagrams.
 * It can be extended to include additional functionality as needed.
 * 
 * @public
 */
export class DocumentService {
    /**
     * Creates a simple example diagram
     */
    createExampleDiagram(): Diagram {
        return new DiagramBuilder("example-diagram", "Example Diagram")
            .node("node1", "Node 1", "default")
            .node("node2", "Node 2", "entity")
            .build();
    }
}