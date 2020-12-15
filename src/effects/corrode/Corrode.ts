import { Effect } from '../Effect';

interface Options {
    grow?: number;                       // grow coeff. 0 - always growing, 1 - never growing
    leftover?: number;                   // leftover coeff. 0 - no leftover, 1 - full leftover
    fadeSpeed?: number;                  // speed fade. 0 - never face, 0.5 - to much fade
    discreteness?: number;
    canvas: HTMLCanvasElement;
}

export class Corrode extends Effect<Options> {
    private fillPoints: [number, number][] = [];
    private field: boolean[] = [];

    constructor(options: Options) {
        super({
            ...((): Required<Options> => ({
                grow: 0.8,
                leftover: 0,
                fadeSpeed: 0.05,
                discreteness: 4,
                canvas: null
            }))(),
            ...options,
        });
    }

    async startEffect(...args): Promise<void>{
        while (this.isRunning()) {
            await this.onCanvasProcess();
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    async click(clickX: number, clickY: number): Promise<void> {
        const rect: DOMRect = this.o.canvas.getBoundingClientRect();
        const left: number = clickX - rect.left - this.o.canvas.clientLeft + this.o.canvas.scrollLeft;
        const top: number = clickY - rect.top - this.o.canvas.clientTop + this.o.canvas.scrollTop;
        const x: number = ~~(window.devicePixelRatio * left / this.o.discreteness);
        const y: number = ~~(window.devicePixelRatio * top / this.o.discreteness);
        const canvW: number = ~~(this.o.canvas.width / this.o.discreteness);
        this.fillPoints.push([x, y]);
        this.field[x + y * canvW] = true;
    }

    private async onCanvasProcess() {
        console.log('onCanvasProcess', this.fillPoints.length);
        const context: CanvasRenderingContext2D = this.o.canvas.getContext('2d');
        const pointsArr: [number, number][] = [];
        const canvW: number = ~~(this.o.canvas.width / this.o.discreteness);
        const canvH: number = ~~(this.o.canvas.height / this.o.discreteness);
        this.fillPoints.forEach((point: [number, number]) => {
            if (this.processPixel(context, point[0], point[1])) {
                let x, y;
                if (point[0] > 0 && Math.random() >= this.o.grow) {
                    x = point[0] - 1;
                    y = point[1];
                    if (this.field[x + y * canvW] !== true) {
                        pointsArr.push([x, y]);
                        this.field[x + y * canvW] = true;
                    }
                }
                if (point[0] < canvW - 1 && Math.random() >= this.o.grow) {
                    x = point[0] + 1;
                    y = point[1];
                    if (this.field[x + y * canvW] !== true) {
                        pointsArr.push([x, y]);
                        this.field[x + y * canvW] = true;
                    }
                }
                if (point[1] > 0 && Math.random() >= this.o.grow) {
                    x = point[0];
                    y = point[1] - 1;
                    if (this.field[x + y * canvW] !== true) {
                        pointsArr.push([x, y]);
                        this.field[x + y * canvW] = true;
                    }
                }
                if (point[1] < canvH - 1 && Math.random() >= this.o.grow) {
                    x = point[0];
                    y = point[1] + 1;
                    if (this.field[x + y * canvW] !== true) {
                        pointsArr.push([x, y]);
                        this.field[x + y * canvW] = true;
                    }
                }
                pointsArr.push(point);
            }
        });
        this.fillPoints = pointsArr;
    }

    private processPixel(context: CanvasRenderingContext2D, x: number, y: number): boolean {
        const imageData: ImageData = context.getImageData(
            x * this.o.discreteness, y * this.o.discreteness, this.o.discreteness, this.o.discreteness
        );
        const pixelData: Uint8ClampedArray = imageData.data;
        let sumLightness: number = 0;
        // Loop over each pixel and invert the color.
        for (let i = 0, n = pixelData.length; i < n; i += 4) {
            let r: number = pixelData[i];
            let g: number = pixelData[i + 1];
            let b: number = pixelData[i + 2];
            const [h, l, s]: [number, number, number] = this.rgbToHls(r, g, b);
            const newLightness: number = Math.max(0, l - this.o.fadeSpeed);
            [r, g, b] = this.hlsToRgb(h, newLightness, s);
            pixelData[i] = r;
            pixelData[i + 1] = g;
            pixelData[i + 2] = b;

            sumLightness += l;
        }
        context.putImageData(imageData, x * this.o.discreteness, y * this.o.discreteness);
        return sumLightness / (this.o.discreteness * this.o.discreteness) > (Math.random() * this.o.leftover * 2 - this.o.leftover);
    }

    rgbToHls(r: number, g: number, b: number): [number, number, number] {
        const r1: number = r / 255;
        const g1: number = g / 255;
        const b1: number = b / 255;
        const cmin: number = Math.min(r1, g1, b1);
        const cmax: number = Math.max(r1, g1, b1);
        const d: number = cmax - cmin;
        const h: number = d === 0
            ? 0
            : (cmax === r1
                    ? 60 * (((g1 - b1) / d) % 6)
                    : (cmax === g1
                            ? 60 * ((b1 - r1) / d + 2)
                            : 60 * ((r1 - g1) / d + 4)
                    )
            );
        const l: number = (cmax + cmin) / 2;
        const s: number = d === 0
            ? 0
            : d / (1 - Math.abs(2 * l - 1));
        return [h, l, s];
    }

    hlsToRgb(h: number, l: number, s: number): [number, number, number] {
        const c: number = (1 - Math.abs(2 * l - 1)) * s;
        const x: number = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m: number = l - c / 2;

        let r, g, b;
        if (h < 60) {
            [r, g, b] = [c, x, 0];
        } else if (h < 120) {
            [r, g, b] = [x, c, 0];
        } else if (h < 180) {
            [r, g, b] = [0, c, x];
        } else if (h < 240) {
            [r, g, b] = [0, x, c];
        } else if (h < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }
        return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
    }
}
