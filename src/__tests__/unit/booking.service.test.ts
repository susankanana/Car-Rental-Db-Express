import {
  createBookingService,
  getBookingService,
  getBookingByIdService,
  updateBookingService,
  deleteBookingService
} from "../../booking/booking.service";
import db from "../../../src/drizzle/db";
import { BookingsTable } from "../../drizzle/schema";

jest.mock("../../../src/drizzle/db", () => ({
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

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([booking])
        })
      });

      const result = await createBookingService(booking);
      expect(db.insert).toHaveBeenCalledWith(BookingsTable);
      expect(result).toBe("Booking added successfully");
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

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValueOnce(bookings)
      });

      const result = await getBookingService();
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

      (db.query.BookingsTable.findFirst as jest.Mock).mockResolvedValueOnce(booking);

      const result = await getBookingByIdService(1);
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

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValueOnce([updated])
          })
        })
      });

      const result = await updateBookingService(1, updated);
      expect(db.update).toHaveBeenCalledWith(BookingsTable);
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

      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([deleted])
        })
      });

      const result = await deleteBookingService(1);
      expect(db.delete).toHaveBeenCalledWith(BookingsTable);
      expect(result).toEqual(deleted);
    });
  });
});
