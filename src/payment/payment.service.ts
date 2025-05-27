import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TIPayment, PaymentTable } from "../drizzle/schema";

export const createPaymentService = async (payment: TIPayment) => {
  await db.insert(PaymentTable).values(payment).returning();
  return "Payment added successfully";
};

export const getPaymentService = async () => {
  const payments = await db.select().from(PaymentTable);
  return payments;
};

export const getPaymentByIdService = async (id: number) => {
  const payment = await db.query.PaymentTable.findFirst({
    where: eq(PaymentTable.paymentID, id),
  });
  return payment;
};

export const updatePaymentService = async (id: number, payment: TIPayment) => {
  await db.update(PaymentTable).set(payment).where(eq(PaymentTable.paymentID, id)).returning();
  return "Payment updated successfully";
};

export const deletePaymentService = async (id: number) => {
  const deleted = await db.delete(PaymentTable).where(eq(PaymentTable.paymentID, id)).returning();
  return deleted[0];
};
