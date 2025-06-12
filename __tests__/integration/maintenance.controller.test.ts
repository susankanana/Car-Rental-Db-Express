import request from "supertest";
import app from "../../src";
import db from "../../src/drizzle/db";
import bcrypt from "bcryptjs";
import { CustomerTable, MaintenanceTable, CarTable, LocationTable} from "../../src/drizzle/schema";
import { eq } from "drizzle-orm";

let adminToken: string;
let customerToken: string;
let adminId: number;
let customerId: number;
let testLocationId: number;
let testMaintenanceId: number;
let testCarId: number;

const adminUser = {
  firstName: "Admin",
  lastName: "Maintenance",
  email: "admin@maintenance.com",
  password: "AdminPass123",
  phoneNumber: "0711000001",
  address: "Admin Garage",
  role: "admin" as const,
  isVerified: true,
};

const customerUser = {
  firstName: "Customer",
  lastName: "Maintenance",
  email: "customer@maintenance.com",
  password: "CustPass123",
  phoneNumber: "0700000001",
  address: "Customer Lane",
  role: "user" as const,
  isVerified: true,
};

beforeAll(async () => {
  await db.delete(CustomerTable);
  await db.delete(MaintenanceTable);
  await db.delete(CarTable);
  await db.delete(LocationTable);
  const hashedAdminPassword = bcrypt.hashSync(adminUser.password, 10);
  const [admin] = await db
    .insert(CustomerTable)
    .values({ ...adminUser, password: hashedAdminPassword })
    .returning();
  adminId = admin.customerID;

  const hashedCustomerPassword = bcrypt.hashSync(customerUser.password, 10);
  const [customer] = await db
    .insert(CustomerTable)
    .values({ ...customerUser, password: hashedCustomerPassword })
    .returning();
  customerId = customer.customerID;

  const adminLogin = await request(app)
    .post("/auth/login")
    .send({ email: adminUser.email, password: adminUser.password });
  adminToken = adminLogin.body.token;

  const customerLogin = await request(app)
    .post("/auth/login")
    .send({ email: customerUser.email, password: customerUser.password });
  customerToken = customerLogin.body.token;

  //Create test location
  const [location] = await db
    .insert(LocationTable)
    .values({
      locationName: "Reservation Test Location",
      address: "123 Reservation St",
      contactNumber: "0700112233",
    })
    .returning();
  testLocationId = location.locationID;

  // Create a test car for maintenance
  const [car] = await db
  .insert(CarTable)
  .values({
    carModel: "Toyota Corolla",
    year: new Date("2023-01-01").toISOString(),
    color: "White",
    rentalRate: "5000.00", // as string to match decimal type
    availability: true,
    locationID: testLocationId,
  })
  .returning();
  testCarId = car.carID;
});

afterAll(async () => {
  if (testMaintenanceId) {
    await db.delete(MaintenanceTable).where(eq(MaintenanceTable.maintenanceID, testMaintenanceId));
  }
  if (testCarId) {
    await db.delete(CarTable).where(eq(CarTable.carID, testCarId));
  }
  if (testLocationId) {
    await db.delete(CarTable).where(eq(CarTable.locationID, testLocationId));
  }
  await db.delete(CustomerTable).where(eq(CustomerTable.customerID, adminId));
  await db.delete(CustomerTable).where(eq(CustomerTable.customerID, customerId));
});

describe("Maintenance Controller Integration Tests", () => {
  it("Should register a maintenance ", async () => {
    const res = await request(app)
      .post("/maintenance/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        carID: testCarId,
        maintenanceDate: "2025-06-01",
        description: "Oil change",
        cost: "2000.00",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBeDefined();

    const [maintenance] = await db
      .select()
      .from(MaintenanceTable)
      .where(eq(MaintenanceTable.carID, testCarId));

    expect(maintenance).toBeTruthy();
    testMaintenanceId = maintenance.maintenanceID;
  });

  it("Should fail to register maintenance without token", async () => {
    const res = await request(app)
      .post("/maintenance/register")
      .send({
        carID: testCarId,
        maintenanceDate: "2025-06-02",
        description: "Brake service",
        cost: "1500.00",
      });

    expect(res.statusCode).toBe(401);
  });

  it("Should get all maintenances", async () => {
    const res = await request(app)
      .get("/maintenances")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("Should get maintenance by ID", async () => {
    const res = await request(app)
      .get(`/maintenance/${testMaintenanceId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("maintenanceID", testMaintenanceId);
  });

  it("Should block customer from getting maintenance by ID", async () => {
    const res = await request(app)
      .get(`/maintenance/${testMaintenanceId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(401);
  });

  it("Should update a maintenance record", async () => {
    const res = await request(app)
      .put(`/maintenance/${testMaintenanceId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ description: "Updated oil change", cost: "2200.00" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Maintenance updated successfully");
  });

  it("Should fail to update maintenance with invalid ID", async () => {
    const res = await request(app)
      .put(`/maintenance/invalid`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ description: "Invalid update" });

    expect(res.statusCode).toBe(400);
  });

  it("Should delete a maintenance record", async () => {
    const res = await request(app)
      .delete(`/maintenance/${testMaintenanceId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(204);
  });

  it("Should block customer from registering maintenance", async () => {
    const res = await request(app)
      .post("/maintenance/register")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        carID: testCarId,
        maintenanceDate: "2025-06-03",
        description: "Suspension check",
        cost: "3000.00",
      });

    expect(res.statusCode).toBe(401);
  });
});
