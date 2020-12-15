export interface IEffect {
    start(...args): Promise<void>;
    stop(): void;
    click(x: number, y: number): Promise<void>;
}
