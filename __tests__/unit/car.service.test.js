"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const car_service_1 = require("../../src/car/car.service");
const db_1 = __importDefault(require("../../src/drizzle/db"));
const schema_1 = require("../../src/drizzle/schema");
// mock the modules
jest.mock("../../src/drizzle/db", () => ({
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    select: jest.fn(),
    query: {
        CarTable: {
            findFirst: jest.fn()
        }
    }
}));
beforeEach(() => {
    jest.clearAllMocks();
});
describe("Car Service", () => {
    describe("createCarService", () => {
        it("should insert a car and return success message", async () => {
            const car = {
                carModel: "Toyota Corolla",
                year: new Date().toISOString(),
                color: "Blue",
                rentalRate: "50.00",
                availability: true,
                locationID: 1
            };
            const inserted = { carID: 1, ...car };
            db_1.default.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([inserted])
                })
            });
            const result = await (0, car_service_1.createCarService)(car);
            expect(db_1.default.insert).toHaveBeenCalledWith(schema_1.CarTable);
            expect(result).toBe("Car added successfully");
        });
        it("should return null if insertion fails", async () => {
            db_1.default.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([])
                })
            });
            const car = {
                carModel: "Failed Car",
                year: new Date().toISOString(),
                color: "Red",
                rentalRate: "100.00",
                availability: true,
                locationID: 2
            };
            const result = await (0, car_service_1.createCarService)(car);
            expect(result).toBeNull();
        });
    });
    describe("getCarService", () => {
        it("should return all cars", async () => {
            const cars = [
                {
                    carID: 1,
                    carModel: "Toyota",
                    year: new Date().toISOString(),
                    color: "Black",
                    rentalRate: "60.00",
                    availability: true,
                    locationID: 1
                },
                {
                    carID: 2,
                    carModel: "Honda",
                    year: new Date(),
                    color: "White",
                    rentalRate: "70.00",
                    availability: true,
                    locationID: 2
                }
            ];
            db_1.default.select.mockReturnValue({
                from: jest.fn().mockResolvedValueOnce(cars)
            });
            const result = await (0, car_service_1.getCarService)();
            expect(result).toEqual(cars);
        });
        it("should return empty array if no cars", async () => {
            db_1.default.select.mockReturnValue({
                from: jest.fn().mockResolvedValueOnce([])
            });
            const result = await (0, car_service_1.getCarService)();
            expect(result).toEqual([]);
        });
    });
    describe("getCarByIdService", () => {
        it("should return a car if found", async () => {
            const car = {
                carID: 1,
                carModel: "Toyota",
                year: new Date(),
                color: "Red",
                rentalRate: "55.00",
                availability: true,
                locationID: 1
            };
            db_1.default.query.CarTable.findFirst.mockResolvedValueOnce(car);
            const result = await (0, car_service_1.getCarByIdService)(1);
            expect(db_1.default.query.CarTable.findFirst).toHaveBeenCalled();
            expect(result).toEqual(car);
        });
        it("should return undefined if not found", async () => {
            db_1.default.query.CarTable.findFirst.mockResolvedValueOnce(undefined);
            const result = await (0, car_service_1.getCarByIdService)(999);
            expect(result).toBeUndefined();
        });
    });
    describe("getCarWithBookingsService", () => {
        it("should return car with bookings", async () => {
            const carWithBookings = {
                carModel: "Nissan",
                bookings: [
                    {
                        bookingID: 1,
                        rentalStartDate: new Date(),
                        rentalEndDate: new Date(),
                        totalAmount: "100.00"
                    }
                ]
            };
            db_1.default.query.CarTable.findFirst.mockResolvedValueOnce(carWithBookings);
            const result = await (0, car_service_1.getCarWithBookingsService)(1);
            expect(result).toEqual(carWithBookings);
        });
        it("should return undefined if car not found", async () => {
            db_1.default.query.CarTable.findFirst.mockResolvedValueOnce(undefined);
            const result = await (0, car_service_1.getCarWithBookingsService)(999);
            expect(result).toBeUndefined();
        });
    });
    describe("updateCarService", () => {
        it("should update a car and return success message", async () => {
            db_1.default.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValueOnce([{}])
                    })
                })
            });
            const updatedCar = {
                carModel: "Updated Car",
                year: new Date().toISOString(),
                color: "Gray",
                rentalRate: "90.00",
                availability: true,
                locationID: 1
            };
            const result = await (0, car_service_1.updateCarService)(1, updatedCar);
            expect(db_1.default.update).toHaveBeenCalledWith(schema_1.CarTable);
            expect(result).toBe("Car updated successfully");
        });
    });
    describe("deleteCarService", () => {
        it("should delete a car and return the deleted car", async () => {
            const deletedCar = {
                carID: 1,
                carModel: "Deleted Car",
                year: new Date(),
                color: "Black",
                rentalRate: "75.00",
                availability: false,
                locationID: 1
            };
            db_1.default.delete.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([deletedCar])
                })
            });
            const result = await (0, car_service_1.deleteCarService)(1);
            expect(db_1.default.delete).toHaveBeenCalledWith(schema_1.CarTable);
            expect(result).toEqual(deletedCar);
        });
    });
});
