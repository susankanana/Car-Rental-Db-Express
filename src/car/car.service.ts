import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TICar, CarTable } from "../drizzle/schema";


export const createCarService = async (car: TICar) => {
  await db.insert(CarTable).values(car).returning();
  return "Car added successfully";
};

export const getCarService = async () => {
  const cars = await db.select().from(CarTable);
  return cars;
};

export const getCarByIdService = async (id: number) => {
  const car = await db.query.CarTable.findFirst({
    where: eq(CarTable.carID, id),
  });
  return car;
};
export const getCarWithBookingsService = async (carID: number) => {
    return await db.query.CarTable.findFirst({
        where: eq(CarTable.carID, carID), 
        columns : {
         carModel: true
        },
        with: {
            bookings: {
                columns: {
                    bookingID: true,
                    rentalStartDate: true,
                    rentalEndDate: true,
                    totalAmount: true
                }
            }
        }
    });
};

export const updateCarService = async (id: number, car: TICar) => {
  await db.update(CarTable).set(car).where(eq(CarTable.carID, id)).returning();
  return "Car updated successfully";
};

export const deleteCarService = async (id: number) => {
  const deletedCar = await db.delete(CarTable).where(eq(CarTable.carID, id)).returning();
  return deletedCar[0];
};
