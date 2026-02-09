import { InfluxDBLogItem } from "./logger";
export declare class InfluxDBLogger {
    private platform;
    private url;
    private token;
    private org;
    private bucket;
    private influxDB;
    isConfigured: boolean;
    constructor(platform: any, config: any);
    errorCheck(): void;
    logMultipleValues(name: string, array: InfluxDBLogItem[]): void;
    logBooleanValue(name: string, characteristic: string, value: boolean): void;
    logIntegerValue(name: string, characteristic: string, value: number): void;
    logFloatValue(name: string, characteristic: string, value: number): void;
    boolToNumber(bool: boolean): number;
}
//# sourceMappingURL=influxDB.d.ts.map