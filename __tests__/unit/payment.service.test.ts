import {
  createPaymentService,
  getPaymentService,
  getPaymentByIdService,
  getPaymentsByBookingIdService,
  updatePaymentService,
  deletePaymentService
} from "../../src/payment/payment.service";

import db from "../../src/drizzle/db";
import { PaymentTable } from "../../src/drizzle/schema";

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

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([payment])
        })
      });

      const result = await createPaymentService(payment);
      expect(db.insert).toHaveBeenCalledWith(PaymentTable);
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

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValueOnce(payments)
      });

      const result = await getPaymentService();
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

      (db.query.PaymentTable.findFirst as jest.Mock).mockResolvedValueOnce(payment);

      const result = await getPaymentByIdService(1);
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

      (db.query.PaymentTable.findMany as jest.Mock).mockResolvedValueOnce(payments);

      const result = await getPaymentsByBookingIdService(3);
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

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValueOnce([updated])
          })
        })
      });

      const result = await updatePaymentService(1, updated);
      expect(db.update).toHaveBeenCalledWith(PaymentTable);
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

      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([deleted])
        })
      });

      const result = await deletePaymentService(1);
      expect(db.delete).toHaveBeenCalledWith(PaymentTable);
      expect(result).toEqual(deleted);
    });
  });
});
