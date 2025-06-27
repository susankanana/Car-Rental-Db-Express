"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const src_1 = __importDefault(require("../../src"));
const db_1 = __importDefault(require("../../src/drizzle/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const schema_1 = require("../../src/drizzle/schema");
const schema_2 = require("../../src/drizzle/schema");
const schema_3 = require("../../src/drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let customerToken;
let adminToken;
let customerId;
let adminId;
let bookingId;
let carId;
const customerUser = {
    firstName: "Customer",
    lastName: "User",
    email: "customer@test.com",
    password: "securePass123",
    phoneNumber: "0712345678",
    address: "123 Test Street",
    role: "user",
    isVerified: true
};
const adminUser = {
    firstName: "Admin",
    lastName: "User",
    email: "admin@test.com",
    password: "securePass456",
    phoneNumber: "0798765432",
    address: "456 Admin Lane",
    role: "admin",
    isVerified: true
};
beforeAll(async () => {
    await db_1.default.delete(schema_1.BookingsTable);
    await db_1.default.delete(schema_2.CustomerTable);
    await db_1.default.delete(schema_3.CarTable);
    // Hash and insert customer
    const hashedCustomerPassword = bcryptjs_1.default.hashSync(customerUser.password, 10);
    const [customer] = await db_1.default.insert(schema_2.CustomerTable).values({
        ...customerUser,
        password: hashedCustomerPassword,
    }).returning();
    customerId = customer.customerID;
    // Hash and insert admin
    const hashedAdminPassword = bcryptjs_1.default.hashSync(adminUser.password, 10);
    const [admin] = await db_1.default.insert(schema_2.CustomerTable).values({
        ...adminUser,
        password: hashedAdminPassword,
    }).returning();
    adminId = admin.customerID;
    // Login customer and get token
    const customerLoginRes = await (0, supertest_1.default)(src_1.default)
        .post("/auth/login")
        .send({
        email: customerUser.email,
        password: customerUser.password,
    });
    customerToken = customerLoginRes.body.token;
    // Login admin and get token
    const adminLoginRes = await (0, supertest_1.default)(src_1.default)
        .post("/auth/login")
        .send({
        email: adminUser.email,
        password: adminUser.password,
    });
    adminToken = adminLoginRes.body.token;
    // Insert a test car
    const [car] = await db_1.default.insert(schema_3.CarTable).values({
        carModel: "Toyota Corolla",
        year: "2020-01-01",
        color: "Blue",
        rentalRate: "1500.00",
        availability: true,
    }).returning();
    carId = car.carID;
});
afterAll(async () => {
    await db_1.default.delete(schema_1.BookingsTable).where((0, drizzle_orm_1.eq)(schema_1.BookingsTable.customerID, customerId));
    await db_1.default.delete(schema_3.CarTable).where((0, drizzle_orm_1.eq)(schema_3.CarTable.carID, carId));
    await db_1.default.delete(schema_2.CustomerTable).where((0, drizzle_orm_1.eq)(schema_2.CustomerTable.customerID, customerId));
    await db_1.default.delete(schema_2.CustomerTable).where((0, drizzle_orm_1.eq)(schema_2.CustomerTable.customerID, adminId));
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
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/booking/register")
            .set("Authorization", `Bearer ${customerToken}`)
            .send(bookingData);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message");
        bookingId = res.body.data.bookingID;
    });
    it("Should get all bookings", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/bookings")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
    it("Should get a booking by id", async () => {
        console.log("bookingId used in test:", bookingId);
        const res = await (0, supertest_1.default)(src_1.default)
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
        const res = await (0, supertest_1.default)(src_1.default)
            .put(`/booking/${bookingId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send(updateData);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Booking updated successfully");
    });
    it("Should delete a booking", async () => {
        console.log("bookingId used in test:", bookingId);
        const res = await (0, supertest_1.default)(src_1.default)
            .delete(`/booking/${bookingId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(204);
        expect(res.body).toEqual({});
    });
    it("Should block access without token", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/bookings")
            .set("Authorization", ``);
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("message", "Unauthorized");
    });
});
