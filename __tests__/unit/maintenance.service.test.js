"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const maintenance_service_1 = require("../../src/maintenance/maintenance.service");
const db_1 = __importDefault(require("../../src/drizzle/db"));
const schema_1 = require("../../src/drizzle/schema");
jest.mock("../../src/drizzle/db", () => ({
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    select: jest.fn(),
    query: {
        MaintenanceTable: {
            findFirst: jest.fn()
        }
    }
}));
beforeEach(() => {
    jest.clearAllMocks();
});
describe("Maintenance Service", () => {
    describe("createMaintenanceService", () => {
        it("should create a maintenance record and return success message", async () => {
            const maintenance = {
                carID: 1,
                maintenanceDate: new Date().toISOString().split("T")[0],
                description: "Oil change",
                cost: "2000.00"
            };
            db_1.default.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([maintenance])
                })
            });
            const result = await (0, maintenance_service_1.createMaintenanceService)(maintenance);
            expect(db_1.default.insert).toHaveBeenCalledWith(schema_1.MaintenanceTable);
            expect(result).toBe("Maintenance added successfully");
        });
    });
    describe("getMaintenanceService", () => {
        it("should return all maintenance records", async () => {
            const maintenances = [
                {
                    maintenanceID: 1,
                    carID: 1,
                    maintenanceDate: "2025-06-08",
                    description: "Oil change",
                    cost: "2000.00"
                },
                {
                    maintenanceID: 2,
                    carID: 2,
                    maintenanceDate: "2025-06-05",
                    description: "Brake replacement",
                    cost: "4500.00"
                }
            ];
            db_1.default.select.mockReturnValue({
                from: jest.fn().mockResolvedValueOnce(maintenances)
            });
            const result = await (0, maintenance_service_1.getMaintenanceService)();
            expect(result).toEqual(maintenances);
        });
    });
    describe("getMaintenanceByIdService", () => {
        it("should return a maintenance record by ID", async () => {
            const maintenance = {
                maintenanceID: 1,
                carID: 1,
                maintenanceDate: "2025-06-08",
                description: "Oil change",
                cost: "2000.00"
            };
            db_1.default.query.MaintenanceTable.findFirst.mockResolvedValueOnce(maintenance);
            const result = await (0, maintenance_service_1.getMaintenanceByIdService)(1);
            expect(result).toEqual(maintenance);
        });
    });
    describe("updateMaintenanceService", () => {
        it("should update a maintenance record and return success message", async () => {
            const updated = {
                carID: 2,
                maintenanceDate: "2025-06-10",
                description: "Tire rotation",
                cost: "1500.00"
            };
            db_1.default.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValueOnce([updated])
                    })
                })
            });
            const result = await (0, maintenance_service_1.updateMaintenanceService)(1, updated);
            expect(db_1.default.update).toHaveBeenCalledWith(schema_1.MaintenanceTable);
            expect(result).toBe("Maintenance updated successfully");
        });
    });
    describe("deleteMaintenanceService", () => {
        it("should delete a maintenance record and return it", async () => {
            const deleted = {
                maintenanceID: 1,
                carID: 1,
                maintenanceDate: "2025-06-08",
                description: "Oil change",
                cost: "2000.00"
            };
            db_1.default.delete.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([deleted])
                })
            });
            const result = await (0, maintenance_service_1.deleteMaintenanceService)(1);
            expect(db_1.default.delete).toHaveBeenCalledWith(schema_1.MaintenanceTable);
            expect(result).toEqual(deleted);
        });
    });
});
