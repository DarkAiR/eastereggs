import { IEffect } from '@/interfaces/IEffect';

export abstract class Effect<T> implements IEffect {
    protected o: T;
    private running: boolean = false;

    protected constructor(options: T) {
        this.o = options;
    }

    protected isRunning(): boolean {
        return this.running;
    }

    async start(...args): Promise<void> {
        if (this.running) {
            return;
        }
        this.running = true;
        await this.startEffect(...args);
    }

    stop(): void {
        this.running = false;
    }

    abstract async startEffect(...args): Promise<void>;
    abstract async click(x: number, y: number): Promise<void>;
}
