export interface Parser<TAst> {
    parse(source: string): TAst;
}