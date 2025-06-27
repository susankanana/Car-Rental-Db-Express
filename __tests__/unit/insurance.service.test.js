"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const insurance_service_1 = require("../../src/insurance/insurance.service");
const db_1 = __importDefault(require("../../src/drizzle/db"));
const schema_1 = require("../../src/drizzle/schema");
jest.mock("../../src/drizzle/db", () => ({
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    select: jest.fn(),
    query: {
        InsuranceTable: {
            findFirst: jest.fn()
        }
    }
}));
beforeEach(() => {
    jest.clearAllMocks();
});
describe("Insurance Service", () => {
    describe("createInsuranceService", () => {
        it("should create an insurance record and return success message", async () => {
            const insurance = {
                carID: 1,
                insuranceProvider: "APA Insurance",
                policyNumber: "POL123456",
                startDate: new Date().toISOString().split("T")[0],
                endDate: new Date().toISOString().split("T")[0]
            };
            db_1.default.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([insurance])
                })
            });
            const result = await (0, insurance_service_1.createInsuranceService)(insurance);
            expect(db_1.default.insert).toHaveBeenCalledWith(schema_1.InsuranceTable);
            expect(result).toBe("Insurance added successfully");
        });
    });
    describe("getInsuranceService", () => {
        it("should return all insurance records", async () => {
            const insurances = [
                {
                    insuranceID: 1,
                    carID: 1,
                    insuranceProvider: "APA Insurance",
                    policyNumber: "POL123456",
                    startDate: "2025-06-01",
                    endDate: "2026-06-01"
                }
            ];
            db_1.default.select.mockReturnValue({
                from: jest.fn().mockResolvedValueOnce(insurances)
            });
            const result = await (0, insurance_service_1.getInsuranceService)();
            expect(result).toEqual(insurances);
        });
    });
    describe("getInsuranceByIdService", () => {
        it("should return an insurance record by ID", async () => {
            const insurance = {
                insuranceID: 1,
                carID: 1,
                insuranceProvider: "APA Insurance",
                policyNumber: "POL123456",
                startDate: "2025-06-01",
                endDate: "2026-06-01"
            };
            db_1.default.query.InsuranceTable.findFirst.mockResolvedValueOnce(insurance);
            const result = await (0, insurance_service_1.getInsuranceByIdService)(1);
            expect(result).toEqual(insurance);
        });
    });
    describe("updateInsuranceService", () => {
        it("should update an insurance record and return success message", async () => {
            const updatedInsurance = {
                carID: 2,
                insuranceProvider: "CIC Insurance",
                policyNumber: "POL654321",
                startDate: "2025-07-01",
                endDate: "2026-07-01"
            };
            db_1.default.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValueOnce([updatedInsurance])
                    })
                })
            });
            const result = await (0, insurance_service_1.updateInsuranceService)(1, updatedInsurance);
            expect(db_1.default.update).toHaveBeenCalledWith(schema_1.InsuranceTable);
            expect(result).toBe("Insurance updated successfully");
        });
    });
    describe("deleteInsuranceService", () => {
        it("should delete an insurance record and return it", async () => {
            const deletedInsurance = {
                insuranceID: 1,
                carID: 1,
                insuranceProvider: "APA Insurance",
                policyNumber: "POL123456",
                startDate: "2025-06-01",
                endDate: "2026-06-01"
            };
            db_1.default.delete.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([deletedInsurance])
                })
            });
            const result = await (0, insurance_service_1.deleteInsuranceService)(1);
            expect(db_1.default.delete).toHaveBeenCalledWith(schema_1.InsuranceTable);
            expect(result).toEqual(deletedInsurance);
        });
    });
});
