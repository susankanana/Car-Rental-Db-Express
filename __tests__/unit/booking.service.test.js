"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const booking_service_1 = require("../../src/booking/booking.service");
const db_1 = __importDefault(require("../../src/drizzle/db"));
const schema_1 = require("../../src/drizzle/schema");
jest.mock("../../src/drizzle/db", () => ({
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    select: jest.fn(),
    query: {
        BookingsTable: {
            findFirst: jest.fn()
        }
    }
}));
beforeEach(() => {
    jest.clearAllMocks();
});
describe("Booking Service", () => {
    describe("createBookingService", () => {
        it("should create a booking and return success message", async () => {
            const booking = {
                carID: 1,
                customerID: 1,
                rentalStartDate: new Date().toISOString(),
                rentalEndDate: new Date().toISOString(),
                totalAmount: "500.00"
            };
            db_1.default.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([booking])
                })
            });
            const result = await (0, booking_service_1.createBookingService)(booking);
            expect(db_1.default.insert).toHaveBeenCalledWith(schema_1.BookingsTable);
            expect(result).toEqual(booking);
        });
    });
    describe("getBookingService", () => {
        it("should return all bookings", async () => {
            const bookings = [
                {
                    bookingID: 1,
                    carID: 1,
                    customerID: 1,
                    rentalStartDate: new Date().toISOString(),
                    rentalEndDate: new Date().toISOString(),
                    totalAmount: "450.00"
                },
                {
                    bookingID: 2,
                    carID: 2,
                    customerID: 2,
                    rentalStartDate: new Date().toISOString(),
                    rentalEndDate: new Date().toISOString(),
                    totalAmount: "1050.00"
                }
            ];
            db_1.default.select.mockReturnValue({
                from: jest.fn().mockResolvedValueOnce(bookings)
            });
            const result = await (0, booking_service_1.getBookingService)();
            expect(result).toEqual(bookings);
        });
    });
    describe("getBookingByIdService", () => {
        it("should return a booking by ID", async () => {
            const booking = {
                bookingID: 1,
                carID: 1,
                customerID: 1,
                rentalStartDate: new Date().toISOString(),
                rentalEndDate: new Date().toISOString(),
                totalAmount: "600.00"
            };
            db_1.default.query.BookingsTable.findFirst.mockResolvedValueOnce(booking);
            const result = await (0, booking_service_1.getBookingByIdService)(1);
            expect(result).toEqual(booking);
        });
    });
    describe("updateBookingService", () => {
        it("should update a booking and return success message", async () => {
            const updated = {
                carID: 2,
                customerID: 2,
                rentalStartDate: new Date().toISOString(),
                rentalEndDate: new Date().toISOString(),
                totalAmount: "550.00"
            };
            db_1.default.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValueOnce([updated])
                    })
                })
            });
            const result = await (0, booking_service_1.updateBookingService)(1, updated);
            expect(db_1.default.update).toHaveBeenCalledWith(schema_1.BookingsTable);
            expect(result).toBe("Booking updated successfully");
        });
    });
    describe("deleteBookingService", () => {
        it("should delete a booking and return it", async () => {
            const deleted = {
                bookingID: 1,
                carID: 1,
                customerID: 1,
                rentalStartDate: new Date().toISOString(),
                rentalEndDate: new Date().toISOString(),
                totalAmount: "400.00"
            };
            db_1.default.delete.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([deleted])
                })
            });
            const result = await (0, booking_service_1.deleteBookingService)(1);
            expect(db_1.default.delete).toHaveBeenCalledWith(schema_1.BookingsTable);
            expect(result).toEqual(deleted);
        });
    });
});
