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
            .node("node1", "Node 1").size(100, 120).position(100, 120)
            .end()
            .node("node2", "Node 2").size(100, 120).position(200, 120)
            .end()
            .build();
    }
}