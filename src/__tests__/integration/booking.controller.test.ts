import request from "supertest";
import app from '../../../src';
import db from '../../drizzle/db'
import bcrypt from 'bcryptjs';
import { BookingsTable } from '../../drizzle/schema';
import { CustomerTable } from '../../drizzle/schema';
import { CarTable } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';


let customerToken: string;
let adminToken: string;
let customerId: number;
let adminId: number;
let bookingId: number;
let carId: number;


const customerUser = {
  firstName: "Customer",
  lastName: "User",
  email: "customer@test.com",
  password: "securePass123",
  phoneNumber: "0712345678",
  address: "123 Test Street",
  role: "user" as "user",
  isVerified: true
};

const adminUser = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@test.com",
  password: "securePass456",
  phoneNumber: "0798765432",
  address: "456 Admin Lane",
  role: "admin" as "admin",
  isVerified: true
};

beforeAll(async () => {
   // Hash and insert customer
  const hashedCustomerPassword = bcrypt.hashSync(customerUser.password, 10);
  const [customer] = await db.insert(CustomerTable).values({
    ...customerUser,
    password: hashedCustomerPassword,
  }).returning();
  customerId = customer.customerID;

  // Hash and insert admin
  const hashedAdminPassword = bcrypt.hashSync(adminUser.password, 10);
  const [admin] = await db.insert(CustomerTable).values({
    ...adminUser,
    password: hashedAdminPassword,
  }).returning();
  adminId = admin.customerID;

  // Login customer and get token
  const customerLoginRes = await request(app)
    .post("/auth/login")
    .send({
      email: customerUser.email,
      password: customerUser.password,
    });
  customerToken = customerLoginRes.body.token;

  // Login admin and get token
  const adminLoginRes = await request(app)
    .post("/auth/login")
    .send({
      email: adminUser.email,
      password: adminUser.password,
    });
  adminToken = adminLoginRes.body.token;

  // Insert a test car
  const [car] = await db.insert(CarTable).values({
    carModel: "Toyota Corolla",
    year: "2020-01-01",
    color: "Blue",
    rentalRate: "1500.00",
    availability: true,
  }).returning();
  carId = car.carID;

});

afterAll(async () => {
  await db.delete(BookingsTable).where(eq(BookingsTable.customerID, customerId));
  await db.delete(CarTable).where(eq(CarTable.carID, carId));
  await db.delete(CustomerTable).where(eq(CustomerTable.customerID, customerId));
  await db.delete(CustomerTable).where(eq(CustomerTable.customerID, adminId));
});

describe("Booking API Integration Tests", () => {
  it("Should create a booking", async () => {
    const bookingData = {
      carID: carId,
      customerID: customerId,
      rentalStartDate: "2025-06-10",
      rentalEndDate: "2025-06-15",
      totalAmount: "7500.00",
    };

    const res = await request(app)
      .post("/booking/register")
      .set("Authorization", `Bearer ${customerToken}`)
      .send(bookingData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
    bookingId = res.body.data.bookingID;

  });

  it("Should get all bookings", async () => {
    
    const res = await request(app)
      .get("/bookings")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("Should get a booking by id", async () => {
     console.log("bookingId used in test:", bookingId);
    const res = await request(app)
    
      .get(`/booking/${bookingId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("bookingID", bookingId);
  });

  it("Should update a booking", async () => {
     console.log("bookingId used in test:", bookingId);
    const updateData = {
      rentalEndDate: "2025-06-18",
      totalAmount: "9000.00",
    };

    const res = await request(app)
      .put(`/booking/${bookingId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Booking updated successfully");
  });

  it("Should delete a booking", async () => {
     console.log("bookingId used in test:", bookingId);
    const res = await request(app)
      .delete(`/booking/${bookingId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({});
  });

  it("Should block access without token", async () => {
    const res = await request(app)
      .get("/bookings")
      .set("Authorization", ``);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });


});