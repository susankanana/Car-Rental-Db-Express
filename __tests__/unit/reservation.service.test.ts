import {
  createReservationService,
  getReservationService,
  getReservationByIdService,
  getReservationsByCustomerIdService,
  updateReservationService,
  deleteReservationService
} from "../../src/reservation/reservation.service";

import db from "../../src/drizzle/db";
import { ReservationTable } from "../../src/drizzle/schema";

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

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([reservation])
        })
      });

      const result = await createReservationService(reservation);
      expect(db.insert).toHaveBeenCalledWith(ReservationTable);
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

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValueOnce(reservations)
      });

      const result = await getReservationService();
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

      (db.query.ReservationTable.findFirst as jest.Mock).mockResolvedValueOnce(reservation);

      const result = await getReservationByIdService(1);
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

      (db.query.ReservationTable.findMany as jest.Mock).mockResolvedValueOnce(reservations);

      const result = await getReservationsByCustomerIdService(4);
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

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValueOnce([updated])
          })
        })
      });

      const result = await updateReservationService(1, updated);
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

      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([deleted])
        })
      });

      const result = await deleteReservationService(1);
      expect(result).toEqual(deleted);
    });
  });
});
