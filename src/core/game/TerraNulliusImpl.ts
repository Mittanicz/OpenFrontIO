import {TerraNullius, Cell, Tile, PlayerID} from "./Game";
import {GameImpl} from "./GameImpl";


export class TerraNulliusImpl implements TerraNullius {
    public tiles: Map<Cell, Tile> = new Map<Cell, Tile>();


    constructor(private gs: GameImpl) {
    }

    id(): PlayerID {
        return 'TerraNulliusID';
    }
    ownsTile(cell: Cell): boolean {
        return this.tiles.has(cell);
    }
    isPlayer(): false {return false as const;}
}