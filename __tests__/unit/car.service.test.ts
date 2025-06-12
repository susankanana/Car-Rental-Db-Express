import {
  createCarService,
  getCarService,
  getCarByIdService,
  updateCarService,
  deleteCarService,
  getCarWithBookingsService
} from "../../src/car/car.service";
import db from "../../src/drizzle/db";
import { CarTable } from "../../src/drizzle/schema";

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

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([inserted])
        })
      });

      const result = await createCarService(car);
      expect(db.insert).toHaveBeenCalledWith(CarTable);
      expect(result).toBe("Car added successfully");
    });

    it("should return null if insertion fails", async () => {
      (db.insert as jest.Mock).mockReturnValue({
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

      const result = await createCarService(car);
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
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValueOnce(cars)
      });

      const result = await getCarService();
      expect(result).toEqual(cars);
    });

    it("should return empty array if no cars", async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValueOnce([])
      });

      const result = await getCarService();
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
      (db.query.CarTable.findFirst as jest.Mock).mockResolvedValueOnce(car);

      const result = await getCarByIdService(1);
      expect(db.query.CarTable.findFirst).toHaveBeenCalled();
      expect(result).toEqual(car);
    });

    it("should return undefined if not found", async () => {
      (db.query.CarTable.findFirst as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await getCarByIdService(999);
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

      (db.query.CarTable.findFirst as jest.Mock).mockResolvedValueOnce(carWithBookings);

      const result = await getCarWithBookingsService(1);
      expect(result).toEqual(carWithBookings);
    });

    it("should return undefined if car not found", async () => {
      (db.query.CarTable.findFirst as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await getCarWithBookingsService(999);
      expect(result).toBeUndefined();
    });
  });

  describe("updateCarService", () => {
    it("should update a car and return success message", async () => {
      (db.update as jest.Mock).mockReturnValue({
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

      const result = await updateCarService(1, updatedCar);
      expect(db.update).toHaveBeenCalledWith(CarTable);
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

      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValueOnce([deletedCar])
        })
      });

      const result = await deleteCarService(1);
      expect(db.delete).toHaveBeenCalledWith(CarTable);
      expect(result).toEqual(deletedCar);
    });
  });
});
