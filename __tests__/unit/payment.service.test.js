"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const payment_service_1 = require("../../src/payment/payment.service");
const db_1 = __importDefault(require("../../src/drizzle/db"));
const schema_1 = require("../../src/drizzle/schema");
jest.mock("../../src/drizzle/db", () => ({
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    select: jest.fn(),
    query: {
        PaymentTable: {
            findFirst: jest.fn(),
            findMany: jest.fn()
        }
    }
}));
beforeEach(() => {
    jest.clearAllMocks();
});
describe("Payment Service", () => {
    describe("createPaymentService", () => {
        it("should create a payment and return success message", async () => {
            const payment = {
                bookingID: 1,
                paymentDate: "2025-06-08",
                amount: "500.00",
                paymentMethod: "Mpesa"
            };
            db_1.default.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([payment])
                })
            });
            const result = await (0, payment_service_1.createPaymentService)(payment);
            expect(db_1.default.insert).toHaveBeenCalledWith(schema_1.PaymentTable);
            expect(result).toEqual(payment);
        });
    });
    describe("getPaymentService", () => {
        it("should return all payments", async () => {
            const payments = [
                {
                    paymentID: 1,
                    bookingID: 1,
                    paymentDate: "2025-06-08",
                    amount: "500.00",
                    paymentMethod: "Mpesa"
                },
                {
                    paymentID: 2,
                    bookingID: 2,
                    paymentDate: "2025-06-07",
                    amount: "750.00",
                    paymentMethod: "Card"
                }
            ];
            db_1.default.select.mockReturnValue({
                from: jest.fn().mockResolvedValueOnce(payments)
            });
            const result = await (0, payment_service_1.getPaymentService)();
            expect(result).toEqual(payments);
        });
    });
    describe("getPaymentByIdService", () => {
        it("should return a payment by ID", async () => {
            const payment = {
                paymentID: 1,
                bookingID: 1,
                paymentDate: "2025-06-08",
                amount: "500.00",
                paymentMethod: "Mpesa"
            };
            db_1.default.query.PaymentTable.findFirst.mockResolvedValueOnce(payment);
            const result = await (0, payment_service_1.getPaymentByIdService)(1);
            expect(result).toEqual(payment);
        });
    });
    describe("getPaymentsByBookingIdService", () => {
        it("should return all payments for a specific booking ID", async () => {
            const payments = [
                {
                    paymentID: 1,
                    bookingID: 3,
                    paymentDate: "2025-06-06",
                    amount: "1000.00",
                    paymentMethod: "Card"
                }
            ];
            db_1.default.query.PaymentTable.findMany.mockResolvedValueOnce(payments);
            const result = await (0, payment_service_1.getPaymentsByBookingIdService)(3);
            expect(result).toEqual(payments);
        });
    });
    describe("updatePaymentService", () => {
        it("should update a payment and return success message", async () => {
            const updated = {
                bookingID: 1,
                paymentDate: "2025-06-09",
                amount: "600.00",
                paymentMethod: "Card"
            };
            db_1.default.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValueOnce([updated])
                    })
                })
            });
            const result = await (0, payment_service_1.updatePaymentService)(1, updated);
            expect(db_1.default.update).toHaveBeenCalledWith(schema_1.PaymentTable);
            expect(result).toBe("Payment updated successfully");
        });
    });
    describe("deletePaymentService", () => {
        it("should delete a payment and return it", async () => {
            const deleted = {
                paymentID: 1,
                bookingID: 1,
                paymentDate: "2025-06-08",
                amount: "500.00",
                paymentMethod: "Mpesa"
            };
            db_1.default.delete.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValueOnce([deleted])
                })
            });
            const result = await (0, payment_service_1.deletePaymentService)(1);
            expect(db_1.default.delete).toHaveBeenCalledWith(schema_1.PaymentTable);
            expect(result).toEqual(deleted);
        });
    });
});
