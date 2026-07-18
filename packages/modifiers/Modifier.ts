export interface Modifier<T> {
    apply(target : T): void;
}