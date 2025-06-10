import request from "supertest";
import app from "../../../src";
import db from "../../drizzle/db";
import bcrypt from "bcryptjs";
import { CarTable } from "../../drizzle/schema";
import { CustomerTable } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

let adminToken: string;
let customerToken: string;
let adminId: number;
let customerId: number;
let testCarId: number;

const adminUser = {
  firstName: "Admin",
  lastName: "Tester",
  email: "admin@car.com",
  password: "AdminPass123",
  phoneNumber: "0712345678",
  address: "Admin Ave",
  role: "admin" as const,
  isVerified: true,
};

const customerUser = {
  firstName: "Customer",
  lastName: "Tester",
  email: "customer@car.com",
  password: "CustPass123",
  phoneNumber: "0700112233",
  address: "Customer Rd",
  role: "user" as const,
  isVerified: true,
};

beforeAll(async () => {
  // Create admin
  const hashedAdminPassword = bcrypt.hashSync(adminUser.password, 10);
  const [admin] = await db
    .insert(CustomerTable)
    .values({ ...adminUser, password: hashedAdminPassword })
    .returning();
  adminId = admin.customerID;

  // Create customer
  const hashedCustomerPassword = bcrypt.hashSync(customerUser.password, 10);
  const [customer] = await db
    .insert(CustomerTable)
    .values({ ...customerUser, password: hashedCustomerPassword })
    .returning();
  customerId = customer.customerID;

  // Login admin
  const adminLogin = await request(app)
    .post("/auth/login")
    .send({ email: adminUser.email, password: adminUser.password });
  adminToken = adminLogin.body.token;

  // Login customer
  const customerLogin = await request(app)
    .post("/auth/login")
    .send({ email: customerUser.email, password: customerUser.password });
  customerToken = customerLogin.body.token;
});

afterAll(async () => {
  await db.delete(CarTable).where(eq(CarTable.carID, testCarId));
  await db.delete(CustomerTable).where(eq(CustomerTable.customerID, adminId));
  await db.delete(CustomerTable).where(eq(CustomerTable.customerID, customerId));
});

describe("Car Controller Integration Tests", () => {
  it("Should create a car", async () => {
    const carData = {
      carModel: "Honda Fit",
      year: "2019-05-01",
      color: "Silver",
      rentalRate: "1200.00",
      availability: true,
    };

    const res = await request(app)
      .post("/car/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(carData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.message).toBe("string");
    const createdCar = await db.query.CarTable.findFirst({
      where: eq(CarTable.carModel, carData.carModel),
    });
    expect(createdCar).toBeTruthy();
    testCarId = createdCar!.carID;
  });

  it("Should fail to create a car without token", async () => {
    const res = await request(app).post("/car/register").send({
      carModel: "Mazda Demio",
      year: "2020-02-02",
      color: "Blue",
      rentalRate: "1100.00",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("Should get all cars", async () => {
    const res = await request(app)
      .get("/cars")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("Should get a car by ID", async () => {
    const res = await request(app)
      .get(`/car/${testCarId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("carID", testCarId);
  });

  it("Should get bookings for a car", async () => {
    const res = await request(app)
      .get(`/car-bookings/${testCarId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    // Even if no bookings exist, the status should be 200 with car info
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("carModel", "Honda Fit");
  });

  it("Should update a car", async () => {
    const res = await request(app)
      .put(`/car/${testCarId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        color: "Black",
        rentalRate: "1350.00",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Car updated successfully");
  });

  it("Should delete a car", async () => {
    const res = await request(app)
      .delete(`/car/${testCarId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(204);
  });

  it("Should block access without token", async () => {
    const res = await request(app).get("/cars");
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});
