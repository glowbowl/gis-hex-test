import { CoordPair } from "h3-js";

export interface IH3Sets {
  title: number | string;
  tileColor: number | string;
  h3Set: string[];
  hexBounds: CoordPair[][];
}
