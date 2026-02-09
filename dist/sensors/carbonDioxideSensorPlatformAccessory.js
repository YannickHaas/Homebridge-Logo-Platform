"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonDioxideSensorPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
class CarbonDioxideSensorPlatformAccessory {
    model = "Carbon Dioxide Sensor";
    api;
    service;
    information;
    fakegatoService;
    services;
    platform;
    device;
    logging;
    updateCarbonDioxideDetectedQueued;
    updateCarbonDioxideLevelQueued;
    updateCarbonDioxidePeakLevelQueued;
    sensStates = {
        CarbonDioxideDetected: 0,
        CarbonDioxideLevel: 0,
        CarbonDioxidePeakLevel: 0,
    };
    name;
    constructor(api, platform, device, parent) {
        this.name = device.name;
        this.api = api;
        this.platform = platform;
        this.device = device;
        this.logging = this.device.logging || 0;
        this.fakegatoService = [];
        this.services = [];
        this.errorCheck();
        this.service = new this.api.hap.Service.CarbonDioxideSensor(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.api.hap.Characteristic.CarbonDioxideDetected)
            .onGet(this.getCarbonDioxideDetected.bind(this));
        if (this.device.carbonDioxideLevel) {
            this.service.getCharacteristic(this.api.hap.Characteristic.CarbonDioxideLevel)
                .onGet(this.getCarbonDioxideLevel.bind(this));
        }
        if (this.device.carbonDioxidePeakLevel) {
            this.service.getCharacteristic(this.api.hap.Characteristic.CarbonDioxidePeakLevel)
                .onGet(this.getCarbonDioxidePeakLevel.bind(this));
        }
        this.information = new this.api.hap.Service.AccessoryInformation()
            .setCharacteristic(this.api.hap.Characteristic.Manufacturer, this.platform.manufacturer)
            .setCharacteristic(this.api.hap.Characteristic.Model, this.model + ' @ ' + this.platform.model)
            .setCharacteristic(this.api.hap.Characteristic.SerialNumber, (0, md5_1.md5)(this.device.name + this.model))
            .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, this.platform.firmwareRevision);
        this.services.push(this.service, this.information);
        if (parent) {
            parent.service.addLinkedService(this.service);
            parent.services.push(this.service);
        }
        this.updateCarbonDioxideDetectedQueued = false;
        this.updateCarbonDioxideLevelQueued = false;
        this.updateCarbonDioxidePeakLevelQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateCarbonDioxideDetected();
                this.updateCarbonDioxideLevel();
                this.updateCarbonDioxidePeakLevel();
            }, this.platform.config.updateInterval);
        }
        if (this.logging) {
            if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
                this.fakegatoService = new this.platform.FakeGatoHistoryService("custom", this, { storage: 'fs' });
                this.services.push(this.fakegatoService);
            }
            setInterval(() => {
                this.logAccessory();
            }, this.platform.loggerInterval);
        }
    }
    errorCheck() {
        if (!this.device.carbonDioxide) {
            this.platform.log.error('[%s] LOGO! Addresses not correct!', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async getCarbonDioxideDetected() {
        const isCarbonDioxideDetected = this.sensStates.CarbonDioxideDetected;
        this.updateCarbonDioxideDetected();
        return isCarbonDioxideDetected;
    }
    async getCarbonDioxideLevel() {
        const isCarbonDioxideLevel = this.sensStates.CarbonDioxideLevel;
        this.updateCarbonDioxideLevel();
        return isCarbonDioxideLevel;
    }
    async getCarbonDioxidePeakLevel() {
        const isCarbonDioxidePeakLevel = this.sensStates.CarbonDioxidePeakLevel;
        this.updateCarbonDioxidePeakLevel();
        return isCarbonDioxidePeakLevel;
    }
    updateCarbonDioxideDetected() {
        if (this.updateCarbonDioxideDetectedQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.carbonDioxide, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.sensStates.CarbonDioxideDetected = value;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get CarbonDioxideDetected -> %i', this.device.name, this.sensStates.CarbonDioxideDetected);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.CarbonDioxideDetected, this.sensStates.CarbonDioxideDetected);
            }
            this.updateCarbonDioxideDetectedQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateCarbonDioxideDetectedQueued = true;
        }
        ;
    }
    updateCarbonDioxideLevel() {
        if (this.device.carbonDioxideLevel) {
            if (this.updateCarbonDioxideLevelQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.carbonDioxideLevel, async (value) => {
                if (value != error_1.ErrorNumber.noData) {
                    this.sensStates.CarbonDioxideLevel = value;
                    if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                        this.platform.log.info('[%s] Get CarbonDioxideLevel -> %f', this.device.name, this.sensStates.CarbonDioxideLevel);
                    }
                    this.service.updateCharacteristic(this.api.hap.Characteristic.CarbonDioxideLevel, this.sensStates.CarbonDioxideLevel);
                }
                this.updateCarbonDioxideLevelQueued = false;
            });
            if (this.platform.queue.enqueue(qItem) === 1) {
                this.updateCarbonDioxideLevelQueued = true;
            }
            ;
        }
    }
    updateCarbonDioxidePeakLevel() {
        if (this.device.carbonDioxidePeakLevel) {
            if (this.updateCarbonDioxidePeakLevelQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.carbonDioxidePeakLevel, async (value) => {
                if (value != error_1.ErrorNumber.noData) {
                    this.sensStates.CarbonDioxidePeakLevel = value;
                    if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                        this.platform.log.info('[%s] Get CarbonDioxidePeakLevel -> %f', this.device.name, this.sensStates.CarbonDioxidePeakLevel);
                    }
                    this.service.updateCharacteristic(this.api.hap.Characteristic.CarbonDioxidePeakLevel, this.sensStates.CarbonDioxidePeakLevel);
                }
                this.updateCarbonDioxidePeakLevelQueued = false;
            });
            if (this.platform.queue.enqueue(qItem) === 1) {
                this.updateCarbonDioxidePeakLevelQueued = true;
            }
            ;
        }
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            let logItems = [];
            logItems.push(new logger_1.InfluxDBLogItem("CarbonDioxideDetected", this.sensStates.CarbonDioxideDetected, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("CarbonDioxideLevel", this.sensStates.CarbonDioxideLevel, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("CarbonDioxidePeakLevel", this.sensStates.CarbonDioxidePeakLevel, logger_1.InfluxDBFild.Int));
            this.platform.influxDB.logMultipleValues(this.device.name, logItems);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            this.fakegatoService.addEntry({ time: Math.round(new Date().valueOf() / 1000), ppm: this.sensStates.CarbonDioxideLevel });
        }
    }
}
exports.CarbonDioxideSensorPlatformAccessory = CarbonDioxideSensorPlatformAccessory;
//# sourceMappingURL=carbonDioxideSensorPlatformAccessory.js.map