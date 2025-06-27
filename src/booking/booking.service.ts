import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TIBooking, BookingsTable } from "../drizzle/schema";

export const createBookingService = async (booking: TIBooking) => {
  const [created] = await db.insert(BookingsTable).values(booking).returning();
  return created;
};

export const getBookingService = async () => {
  const bookings = await db.select().from(BookingsTable);
  return bookings;
};

export const getBookingByIdService = async (id: number) => {
  const booking = await db.query.BookingsTable.findFirst({
    where: eq(BookingsTable.bookingID, id),
  });
  return booking;
};

export const getBookingssByCustomerIdService = async (customerId: number) => {
  const  bookings = await db.query.BookingsTable.findMany({
    where: eq(BookingsTable.customerID, customerId),
  });
  return bookings;
};

export const updateBookingService = async (id: number, booking: TIBooking) => {
  await db.update(BookingsTable).set(booking).where(eq(BookingsTable.bookingID, id)).returning();
  return "Booking updated successfully";
};

export const deleteBookingService = async (id: number) => {
  const deleted = await db.delete(BookingsTable).where(eq(BookingsTable.bookingID, id)).returning();
  return deleted[0];
};
