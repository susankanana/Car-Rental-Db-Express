import {
  createInsuranceService,
  getInsuranceService,
  getInsuranceByIdService,
  updateInsuranceService,
  deleteInsuranceService
} from "../../src/insurance/insurance.service";

import db from "../../src/drizzle/db";
import { InsuranceTable } from "../../src/drizzle/schema";

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

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([insurance])
        })
      });

      const result = await createInsuranceService(insurance);
      expect(db.insert).toHaveBeenCalledWith(InsuranceTable);
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

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValueOnce(insurances)
      });

      const result = await getInsuranceService();
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

      (db.query.InsuranceTable.findFirst as jest.Mock).mockResolvedValueOnce(insurance);

      const result = await getInsuranceByIdService(1);
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

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValueOnce([updatedInsurance])
          })
        })
      });

      const result = await updateInsuranceService(1, updatedInsurance);
      expect(db.update).toHaveBeenCalledWith(InsuranceTable);
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

      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([deletedInsurance])
        })
      });

      const result = await deleteInsuranceService(1);
      expect(db.delete).toHaveBeenCalledWith(InsuranceTable);
      expect(result).toEqual(deletedInsurance);
    });
  });
});
