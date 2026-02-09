export declare class LoggerType {
    static None: string;
    static InfluxDB: string;
    static Fakegato: string;
}
export declare class LoggerInterval {
    static T_30Sec: number;
    static T_5Min: number;
}
export declare class InfluxDBFild {
    static Bool: number;
    static Int: number;
    static Float: number;
}
export declare class InfluxDBLogItem {
    characteristic: string;
    value: any;
    type: InfluxDBFild;
    constructor(characteristic: string, value: any, type: InfluxDBFild);
}
//# sourceMappingURL=logger.d.ts.map