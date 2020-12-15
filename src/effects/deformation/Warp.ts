import { Effect } from '../Effect';

interface Options {
    func: (x: number, y: number, w: number, h: number, t: number) => [number, number];     // transformation function, (x,y) in range [0...width/height] of canvas
    canvas: HTMLCanvasElement;
}

export class Warp extends Effect<Options> {
    private imageData: Uint8ClampedArray = null;
    private context: CanvasRenderingContext2D = null;
    private t: number = 0;

    get canvas() {
        return 1;
    }

    constructor(options: Options) {
        super({
            ...((): Required<Options> => ({
                func: null,
                canvas: null
            }))(),
            ...options,
        });
        if (this.o.func === null) {
            throw new Error('<func> must be specified');
        }
    }

    async startEffect(...args): Promise<void>{
        while (this.isRunning()) {
            if (this.imageData === null) {
                this.init();
            }
            await this.onCanvasProcess();
            this.t++;
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    async click(clickX: number, clickY: number): Promise<void> {
        // Do nothing
    }

    private init() {
        this.context = this.o.canvas.getContext('2d');
        const imageData: ImageData = this.context.getImageData(
            0, 0, this.o.canvas.width, this.o.canvas.height
        );
        this.imageData = new Uint8ClampedArray(imageData.data);
    }

    /**
     * (dx, dy) = func(x, y, w, h, t)
     * For example: func(x, y, w, h, t) = sin(2 * PI * x / w + t) * cos(2 * PI * y / h + t)
     */
    private async onCanvasProcess() {
        const w: number = this.o.canvas.width;
        const h: number = this.o.canvas.height;
        const imageData: ImageData = this.context.getImageData(0, 0, w, h);

        for (let y: number = 0; y < h; y++) {
            for (let x: number = 0; x < w; x++) {
                const [offsX, offsY] = this.o.func(x, y, w, h, this.t);

                const toOffs: number = 4 * (y * w + x);
                const fromOffs: number = toOffs + 4 * (offsY * w + offsX);
                if (y + offsY < 0 || y + offsY >= h || x + offsX < 0 || x + offsX >= w) {
                    imageData.data[toOffs] = 0;
                    imageData.data[toOffs + 1] = 0;
                    imageData.data[toOffs + 2] = 0;
                    imageData.data[toOffs + 3] = 0;
                } else {
                    imageData.data[toOffs] = this.imageData[fromOffs];
                    imageData.data[toOffs + 1] = this.imageData[fromOffs + 1];
                    imageData.data[toOffs + 2] = this.imageData[fromOffs + 2];
                    imageData.data[toOffs + 3] = this.imageData[fromOffs + 3];
                }
            }
        }
        this.context.putImageData(imageData, 0, 0);
    }
}
