"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reservation_service_1 = require("../../src/reservation/reservation.service");
const db_1 = __importDefault(require("../../src/drizzle/db"));
const schema_1 = require("../../src/drizzle/schema");
jest.mock("../../src/drizzle/db", () => ({
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    query: {
        ReservationTable: {
            findFirst: jest.fn(),
            findMany: jest.fn()
        }
    }
}));
beforeEach(() => {
    jest.clearAllMocks();
});
describe("Reservation Service", () => {
    describe("createReservationService", () => {
        it("should create a reservation and return success message", async () => {
            const reservation = {
                customerID: 1,
                carID: 2,
                reservationDate: "2025-06-08",
                pickupDate: "2025-06-09",
                returnDate: "2025-06-10"
            };
            db_1.default.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([reservation])
                })
            });
            const result = await (0, reservation_service_1.createReservationService)(reservation);
            expect(db_1.default.insert).toHaveBeenCalledWith(schema_1.ReservationTable);
            expect(result).toEqual(reservation);
        });
    });
    describe("getReservationService", () => {
        it("should return all reservations", async () => {
            const reservations = [
                {
                    reservationID: 1,
                    customerID: 1,
                    carID: 2,
                    reservationDate: "2025-06-08",
                    pickupDate: "2025-06-09",
                    returnDate: "2025-06-10"
                }
            ];
            db_1.default.select.mockReturnValue({
                from: jest.fn().mockResolvedValueOnce(reservations)
            });
            const result = await (0, reservation_service_1.getReservationService)();
            expect(result).toEqual(reservations);
        });
    });
    describe("getReservationByIdService", () => {
        it("should return a reservation by ID", async () => {
            const reservation = {
                reservationID: 1,
                customerID: 1,
                carID: 2,
                reservationDate: "2025-06-08",
                pickupDate: "2025-06-09",
                returnDate: "2025-06-10"
            };
            db_1.default.query.ReservationTable.findFirst.mockResolvedValueOnce(reservation);
            const result = await (0, reservation_service_1.getReservationByIdService)(1);
            expect(result).toEqual(reservation);
        });
    });
    describe("getReservationsByCustomerIdService", () => {
        it("should return reservations for a given customer ID", async () => {
            const reservations = [
                {
                    reservationID: 1,
                    customerID: 4,
                    carID: 3,
                    reservationDate: "2025-06-01",
                    pickupDate: "2025-06-02",
                    returnDate: "2025-06-05"
                }
            ];
            db_1.default.query.ReservationTable.findMany.mockResolvedValueOnce(reservations);
            const result = await (0, reservation_service_1.getReservationsByCustomerIdService)(4);
            expect(result).toEqual(reservations);
        });
    });
    describe("updateReservationService", () => {
        it("should update a reservation and return success message", async () => {
            const updated = {
                customerID: 1,
                carID: 2,
                reservationDate: "2025-06-10",
                pickupDate: "2025-06-11",
                returnDate: "2025-06-13"
            };
            db_1.default.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValueOnce([updated])
                    })
                })
            });
            const result = await (0, reservation_service_1.updateReservationService)(1, updated);
            expect(result).toBe("Reservation updated successfully");
        });
    });
    describe("deleteReservationService", () => {
        it("should delete a reservation and return it", async () => {
            const deleted = {
                reservationID: 1,
                customerID: 1,
                carID: 2,
                reservationDate: "2025-06-08",
                pickupDate: "2025-06-09",
                returnDate: "2025-06-10"
            };
            db_1.default.delete.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([deleted])
                })
            });
            const result = await (0, reservation_service_1.deleteReservationService)(1);
            expect(result).toEqual(deleted);
        });
    });
});
