import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TILocation, LocationTable } from "../drizzle/schema";

// Create Location
export const createLocationService = async (location: TILocation) => {
  await db.insert(LocationTable).values(location).returning();
  return  "Location added successfully";
};

// Get all Locations
export const getLocationService = async () => {
  const locations = await db.select().from(LocationTable);
  return locations;
};

// Get Location by ID
export const getLocationByIdService = async (id: number) => {
  const location = await db.query.LocationTable.findFirst({
    where: eq(LocationTable.locationID, id),
  });
  return location;
};

// Update Location
export const updateLocationService = async (id: number, location: TILocation) => {
    await db.update(LocationTable).set(location).where(eq(LocationTable.locationID, id)).returning();
    return "Location updated successfully";
}

// Delete Location
export const deleteLocationService = async (id: number) => {
  const deletedLocation = await db
    .delete(LocationTable)
    .where(eq(LocationTable.locationID, id))
    .returning();
  return deletedLocation[0];
};