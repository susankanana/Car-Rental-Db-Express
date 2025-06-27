"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const location_service_1 = require("../../src/location/location.service");
const db_1 = __importDefault(require("../../src/drizzle/db"));
const schema_1 = require("../../src/drizzle/schema");
jest.mock("../../src/drizzle/db", () => ({
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
            db_1.default.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([location])
                })
            });
            const result = await (0, location_service_1.createLocationService)(location);
            expect(db_1.default.insert).toHaveBeenCalledWith(schema_1.LocationTable);
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
            db_1.default.select.mockReturnValue({
                from: jest.fn().mockResolvedValueOnce(locations)
            });
            const result = await (0, location_service_1.getLocationService)();
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
            db_1.default.query.LocationTable.findFirst.mockResolvedValueOnce(location);
            const result = await (0, location_service_1.getLocationByIdService)(1);
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
            db_1.default.query.LocationTable.findFirst.mockResolvedValueOnce(locationWithCars);
            const result = await (0, location_service_1.getLocationWithCarsService)(1);
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
            db_1.default.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValueOnce([updated])
                    })
                })
            });
            const result = await (0, location_service_1.updateLocationService)(1, updated);
            expect(db_1.default.update).toHaveBeenCalledWith(schema_1.LocationTable);
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
            db_1.default.delete.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([deleted])
                })
            });
            const result = await (0, location_service_1.deleteLocationService)(1);
            expect(db_1.default.delete).toHaveBeenCalledWith(schema_1.LocationTable);
            expect(result).toEqual(deleted);
        });
    });
});
