export type mapType = "rowColumn" | "seatId";

export interface SeatMapModel {
    eventGuId: string;
    seasonId: number;
    mapId: number;
    mapType: mapType;
  }