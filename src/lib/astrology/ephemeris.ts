/** Fail-closed ephemeris adapter. The supplied notebook did not contain a validated full planetary engine. */
export type AyanamsaMode='LAHIRI_CHITRAPAKSHA'|'KP_NEW';
export interface ChartRequest{birthUtc:string;latitude:number;longitude:number;ayanamsa:AyanamsaMode;nodeMode:'TRUE'|'MEAN';}
export async function calculateEphemeris(_request:ChartRequest):Promise<never>{throw new Error('EPHEMERIS_NOT_CONFIGURED: validated planetary longitudes and Ascendant provider required; no guessed chart will be returned.');}
