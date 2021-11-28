export class Tools {
    static dice(min: number, max: number): number {
        const range = max - min + 1;
        return min + Math.floor(Math.random() * range);
    }

    static distinctColors: string[] = [
        '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
        '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4',
        '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000',
        '#aaffc3', '#808000', '#ffd8b1', /*'#000075',*/ '#a9a9a9',
    ];

    static pallette(order: number): string {
        return Tools.distinctColors[order % Tools.distinctColors.length];
    }

    static palletteRand(): string {
        return Tools.pallette(Tools.dice(0, Tools.distinctColors.length));
    }




}
