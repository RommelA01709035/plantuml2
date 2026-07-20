import { Diagram } from "../core";
import { DiagramParser } from "./parsers";

export interface Parser<TAst> {
    parse(source: string): TAst;
}