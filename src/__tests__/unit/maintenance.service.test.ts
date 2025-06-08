import {
  createMaintenanceService,
  getMaintenanceService,
  getMaintenanceByIdService,
  updateMaintenanceService,
  deleteMaintenanceService
} from "../../maintenance/maintenance.service";

import db from "../../../src/drizzle/db";
import { MaintenanceTable } from "../../drizzle/schema";

jest.mock("../../../src/drizzle/db", () => ({
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

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([maintenance])
        })
      });

      const result = await createMaintenanceService(maintenance);
      expect(db.insert).toHaveBeenCalledWith(MaintenanceTable);
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

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValueOnce(maintenances)
      });

      const result = await getMaintenanceService();
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

      (db.query.MaintenanceTable.findFirst as jest.Mock).mockResolvedValueOnce(maintenance);

      const result = await getMaintenanceByIdService(1);
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

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValueOnce([updated])
          })
        })
      });

      const result = await updateMaintenanceService(1, updated);
      expect(db.update).toHaveBeenCalledWith(MaintenanceTable);
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

      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([deleted])
        })
      });

      const result = await deleteMaintenanceService(1);
      expect(db.delete).toHaveBeenCalledWith(MaintenanceTable);
      expect(result).toEqual(deleted);
    });
  });
});
