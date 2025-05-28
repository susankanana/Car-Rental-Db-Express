import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TIReservation, ReservationTable } from "../drizzle/schema";

export const createReservationService = async (reservation: TIReservation) => {
  await db.insert(ReservationTable).values(reservation).returning();
  return "Reservation added successfully";
};

export const getReservationService = async () => {
  const reservations = await db.select().from(ReservationTable);
  return reservations;
};

export const getReservationByIdService = async (id: number) => {
  const reservation = await db.query.ReservationTable.findFirst({
    where: eq(ReservationTable.reservationID, id),
  });
  return reservation;
};

export const getReservationsByCustomerIdService = async (customerId: number) => {
  const reservations = await db.query.ReservationTable.findMany({
    where: eq(ReservationTable.customerID, customerId),
  });
  return reservations;
};

export const updateReservationService = async (id: number, reservation: TIReservation) => {
  await db.update(ReservationTable).set(reservation).where(eq(ReservationTable.reservationID, id)).returning();
  return "Reservation updated successfully";
};

export const deleteReservationService = async (id: number) => {
  const deleted = await db.delete(ReservationTable).where(eq(ReservationTable.reservationID, id)).returning();
  return deleted[0];
};
