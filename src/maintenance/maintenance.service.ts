import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TIMaintenance, MaintenanceTable } from "../drizzle/schema";

export const createMaintenanceService = async (maintenance: TIMaintenance) => {
  await db.insert(MaintenanceTable).values(maintenance).returning();
  return "Maintenance added successfully";
};

export const getMaintenanceService = async () => {
  const maintenances = await db.select().from(MaintenanceTable);
  return maintenances;
};

export const getMaintenanceByIdService = async (id: number) => {
  const maintenance = await db.query.MaintenanceTable.findFirst({
    where: eq(MaintenanceTable.maintenanceID, id),
  });
  return maintenance;
};

export const updateMaintenanceService = async (id: number, maintenance: TIMaintenance) => {
  await db.update(MaintenanceTable).set(maintenance).where(eq(MaintenanceTable.maintenanceID, id)).returning();
  return "Maintenance updated successfully";
};

export const deleteMaintenanceService = async (id: number) => {
  const deleted = await db.delete(MaintenanceTable).where(eq(MaintenanceTable.maintenanceID, id)).returning();
  return deleted[0];
};
