import request from "supertest";
import app from "../../../src";
import db from "../../drizzle/db";
import bcrypt from "bcryptjs";
import { CustomerTable, LocationTable } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

let adminToken: string;
let customerToken: string;
let adminId: number;
let customerId: number;
let testLocationId: number;

const adminUser = {
  firstName: "Admin",
  lastName: "Location",
  email: "admin@location.com",
  password: "AdminPass123",
  phoneNumber: "0711000000",
  address: "Admin Lane",
  role: "admin" as const,
  isVerified: true,
};

const customerUser = {
  firstName: "Customer",
  lastName: "Location",
  email: "customer@location.com",
  password: "CustPass123",
  phoneNumber: "0700000000",
  address: "Customer Street",
  role: "user" as const,
  isVerified: true,
};

beforeAll(async () => {
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
});

afterAll(async () => {
  if (testLocationId) {
    await db.delete(LocationTable).where(eq(LocationTable.locationID, testLocationId));
  }
  await db.delete(CustomerTable).where(eq(CustomerTable.customerID, adminId));
  await db.delete(CustomerTable).where(eq(CustomerTable.customerID, customerId));
});

describe("Location Controller Integration Tests", () => {
  it("Should register a location", async () => {
    const res = await request(app)
      .post("/location/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        locationName: "Nairobi Central",
        address: "Moi Avenue",
        contactNumber: "0722001122",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBeDefined();

    const location = await db.query.LocationTable.findFirst({
      where: eq(LocationTable.locationName, "Nairobi Central"),
    });

    expect(location).toBeTruthy();
    testLocationId = location!.locationID;
  });

  it("Should fail to register a location without token", async () => {
    const res = await request(app)
      .post("/location/register")
      .send({
        locationName: "Unauthorized Place",
        address: "No Auth Street",
        contactNumber: "0733445566",
      });

    expect(res.statusCode).toBe(401);
  });

  it("Should get all locations", async () => {
    const res = await request(app)
      .get("/locations")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("Should get location by ID", async () => {
    const res = await request(app)
      .get(`/location/${testLocationId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("locationID", testLocationId);
  });

  it("Should block user from getting location by ID", async () => {
    const res = await request(app)
      .get(`/location/${testLocationId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(401);
  });

  it("Should get location with cars", async () => {
    const res = await request(app)
      .get(`/locations-cars/${testLocationId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("locationName");
    expect(res.body).toHaveProperty("cars");
  });

  it("Should update a location ", async () => {
    const res = await request(app)
      .put(`/location/${testLocationId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ contactNumber: "0799111222" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Location updated successfully");
  });

  it("Should fail to update location with invalid ID", async () => {
    const res = await request(app)
      .put(`/location/invalid`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ contactNumber: "0799111222" });

    expect(res.statusCode).toBe(400);
  });

  it("Should delete location", async () => {
    const res = await request(app)
      .delete(`/location/${testLocationId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(204);
  });

  it("Should block customer from registering location", async () => {
    const res = await request(app)
      .post("/location/register")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        locationName: "Blocked Location",
        address: "Blocked Lane",
        contactNumber: "0711888999",
      });

    expect(res.statusCode).toBe(401);
  });
});
