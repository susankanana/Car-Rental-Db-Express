import {
  createLocationService,
  getLocationService,
  getLocationByIdService,
  getLocationWithCarsService,
  updateLocationService,
  deleteLocationService
} from "../../location/location.service";

import db from "../../../src/drizzle/db";
import { LocationTable } from "../../drizzle/schema";

jest.mock("../../../src/drizzle/db", () => ({
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  select: jest.fn(),
  query: {
    LocationTable: {
      findFirst: jest.fn()
    }
  }
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Location Service", () => {
  describe("createLocationService", () => {
    it("should create a location and return success message", async () => {
      const location = {
        locationName: "Downtown Branch",
        address: "123 Main Street, Nairobi",
        contactNumber: "0712345678"
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([location])
        })
      });

      const result = await createLocationService(location);
      expect(db.insert).toHaveBeenCalledWith(LocationTable);
      expect(result).toBe("Location added successfully");
    });
  });

  describe("getLocationService", () => {
    it("should return all locations", async () => {
      const locations = [
        {
          locationID: 1,
          locationName: "Downtown Branch",
          address: "123 Main Street, Nairobi",
          contactNumber: "0712345678"
        },
        {
          locationID: 2,
          locationName: "Westlands Branch",
          address: "456 Side Street, Nairobi",
          contactNumber: "0798765432"
        }
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValueOnce(locations)
      });

      const result = await getLocationService();
      expect(result).toEqual(locations);
    });
  });

  describe("getLocationByIdService", () => {
    it("should return a location by ID", async () => {
      const location = {
        locationID: 1,
        locationName: "Downtown Branch",
        address: "123 Main Street, Nairobi",
        contactNumber: "0712345678"
      };

      (db.query.LocationTable.findFirst as jest.Mock).mockResolvedValueOnce(location);

      const result = await getLocationByIdService(1);
      expect(result).toEqual(location);
    });
  });

  describe("getLocationWithCarsService", () => {
    it("should return location with cars", async () => {
      const locationWithCars = {
        locationName: "Downtown Branch",
        address: "123 Main Street, Nairobi",
        contactNumber: "0712345678",
        cars: [
          {
            carID: 1,
            carModel: "Toyota Axio",
            color: "Silver",
            rentalRate: "3000.00",
            availability: true
          }
        ]
      };

      (db.query.LocationTable.findFirst as jest.Mock).mockResolvedValueOnce(locationWithCars);

      const result = await getLocationWithCarsService(1);
      expect(result).toEqual(locationWithCars);
    });
  });

  describe("updateLocationService", () => {
    it("should update a location and return success message", async () => {
      const updated = {
        locationName: "Updated Branch",
        address: "789 New Street, Nairobi",
        contactNumber: "0700000000"
      };

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValueOnce([updated])
          })
        })
      });

      const result = await updateLocationService(1, updated);
      expect(db.update).toHaveBeenCalledWith(LocationTable);
      expect(result).toBe("Location updated successfully");
    });
  });

  describe("deleteLocationService", () => {
    it("should delete a location and return it", async () => {
      const deleted = {
        locationID: 1,
        locationName: "Downtown Branch",
        address: "123 Main Street, Nairobi",
        contactNumber: "0712345678"
      };

      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([deleted])
        })
      });

      const result = await deleteLocationService(1);
      expect(db.delete).toHaveBeenCalledWith(LocationTable);
      expect(result).toEqual(deleted);
    });
  });
});
