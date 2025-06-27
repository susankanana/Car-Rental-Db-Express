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
const drizzle_orm_1 = require("drizzle-orm");
let adminToken;
let customerToken;
let adminId;
let customerId;
let testBookingId;
let testPaymentId;
let testLocationId;
let testCarId;
const adminUser = {
    firstName: "Admin",
    lastName: "Payment",
    email: "admin.payment@example.com",
    password: "AdminPass123",
    phoneNumber: "0711000002",
    address: "Admin Office",
    role: "admin",
    isVerified: true,
};
const customerUser = {
    firstName: "Customer",
    lastName: "Payment",
    email: "customer.payment@example.com",
    password: "CustPass123",
    phoneNumber: "0700000002",
    address: "Customer Home",
    role: "user",
    isVerified: true,
};
beforeAll(async () => {
    await db_1.default.delete(schema_1.BookingsTable);
    await db_1.default.delete(schema_1.CustomerTable);
    await db_1.default.delete(schema_1.PaymentTable);
    await db_1.default.delete(schema_1.CarTable);
    await db_1.default.delete(schema_1.LocationTable);
    // Create Admin User
    const hashedAdminPassword = bcryptjs_1.default.hashSync(adminUser.password, 10);
    const [admin] = await db_1.default
        .insert(schema_1.CustomerTable)
        .values({ ...adminUser, password: hashedAdminPassword })
        .returning();
    adminId = admin.customerID;
    // Create Customer User
    const hashedCustomerPassword = bcryptjs_1.default.hashSync(customerUser.password, 10);
    const [customer] = await db_1.default
        .insert(schema_1.CustomerTable)
        .values({ ...customerUser, password: hashedCustomerPassword })
        .returning();
    customerId = customer.customerID;
    // Login as Admin
    const adminLogin = await (0, supertest_1.default)(src_1.default)
        .post("/auth/login")
        .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.token;
    // Login as Customer
    const customerLogin = await (0, supertest_1.default)(src_1.default)
        .post("/auth/login")
        .send({ email: customerUser.email, password: customerUser.password });
    customerToken = customerLogin.body.token;
    //Create test location
    const [location] = await db_1.default
        .insert(schema_1.LocationTable)
        .values({
        locationName: "Reservation Test Location",
        address: "123 Reservation St",
        contactNumber: "0700112233",
    })
        .returning();
    testLocationId = location.locationID;
    // Create a test car (needed for booking)
    const [car] = await db_1.default
        .insert(schema_1.CarTable)
        .values({
        carModel: "Honda Civic",
        year: new Date("2020-01-01").toISOString(),
        color: "Red",
        rentalRate: "3000.00",
        availability: true,
        locationID: testLocationId, // Assuming locationID 1 exists or is created in a global setup
    })
        .returning();
    testCarId = car.carID;
    // Create a test booking (needed for payment)
    const [booking] = await db_1.default
        .insert(schema_1.BookingsTable)
        .values({
        customerID: customerId,
        carID: testCarId,
        rentalStartDate: new Date().toISOString().split('T')[0],
        rentalEndDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
        totalAmount: "9000.00", // 3 days * 3000.00
    })
        .returning();
    testBookingId = booking.bookingID;
});
afterAll(async () => {
    // Clean up in reverse order of creation (payments -> bookings -> cars -> customers)
    if (testPaymentId) {
        await db_1.default.delete(schema_1.PaymentTable).where((0, drizzle_orm_1.eq)(schema_1.PaymentTable.paymentID, testPaymentId));
    }
    if (testBookingId) {
        await db_1.default.delete(schema_1.BookingsTable).where((0, drizzle_orm_1.eq)(schema_1.BookingsTable.bookingID, testBookingId));
    }
    if (testCarId) {
        await db_1.default.delete(schema_1.CarTable).where((0, drizzle_orm_1.eq)(schema_1.CarTable.carID, testCarId));
    }
    if (testLocationId) {
        await db_1.default.delete(schema_1.CarTable).where((0, drizzle_orm_1.eq)(schema_1.CarTable.locationID, testLocationId));
    }
    await db_1.default.delete(schema_1.CustomerTable).where((0, drizzle_orm_1.eq)(schema_1.CustomerTable.customerID, adminId));
    await db_1.default.delete(schema_1.CustomerTable).where((0, drizzle_orm_1.eq)(schema_1.CustomerTable.customerID, customerId));
});
describe("Payment Controller Integration Tests", () => {
    it("Should register a payment as a user (customer)", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/payment/register")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
            bookingID: testBookingId,
            paymentDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            amount: "9000.00",
            paymentMethod: "Credit Card",
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBeDefined(); // Expecting the inserted payment object
        expect(res.body.message).toBe("Payment made successfully");
        const [payment] = await db_1.default
            .select()
            .from(schema_1.PaymentTable)
            .where((0, drizzle_orm_1.eq)(schema_1.PaymentTable.bookingID, testBookingId));
        expect(payment).toBeTruthy();
        testPaymentId = payment.paymentID;
    });
    it("Should fail to register payment without token", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/payment/register")
            .send({
            bookingID: testBookingId,
            paymentDate: new Date().toISOString().split('T')[0],
            amount: "100.00",
            paymentMethod: "Cash",
        });
        expect(res.statusCode).toBe(401);
    });
    it("Should get all payments as an admin", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/payments")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0]).toHaveProperty("paymentID");
    });
    it("Should get a payment by ID as an admin", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get(`/payment/${testPaymentId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty("paymentID", testPaymentId);
    });
    it("Should fail to get a payment by ID with invalid ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/payment/invalid-id")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid ID");
    });
    it("Should fail to get a payment by ID if not found", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/payment/99999") // Non-existent ID
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Payment not found");
    });
    it("Should get payments by booking ID as a user", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get(`/payments/booking/${testBookingId}`)
            .set("Authorization", `Bearer ${customerToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0]).toHaveProperty("bookingID", testBookingId);
    });
    it("Should fail to get payments by booking ID with invalid ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/payments/booking/invalid-id")
            .set("Authorization", `Bearer ${customerToken}`);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid ID");
    });
    it("Should update a payment as both admin or user", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .put(`/payment/${testPaymentId}`)
            .set("Authorization", `Bearer ${customerToken}`) // Using customer token for `bothRoleAuth`
            .send({ amount: "9500.00", paymentMethod: "M-Pesa" });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Payment updated successfully");
        // Verify update
        const [updatedPayment] = await db_1.default
            .select()
            .from(schema_1.PaymentTable)
            .where((0, drizzle_orm_1.eq)(schema_1.PaymentTable.paymentID, testPaymentId));
        expect(updatedPayment.amount).toBe("9500.00"); // Drizzle returns decimal as string
        expect(updatedPayment.paymentMethod).toBe("M-Pesa");
    });
    it("Should fail to update payment with invalid ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .put("/payment/invalid-id")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ amount: "100.00" });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid ID");
    });
    it("Should fail to update payment if not found", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .put("/payment/99999") // Non-existent ID
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ amount: "100.00" });
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Payment not found");
    });
    it("Should delete a payment as an admin", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .delete(`/payment/${testPaymentId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(204);
        // Verify deletion
        const [deletedPayment] = await db_1.default
            .select()
            .from(schema_1.PaymentTable)
            .where((0, drizzle_orm_1.eq)(schema_1.PaymentTable.paymentID, testPaymentId));
        expect(deletedPayment).toBeUndefined(); // Should not exist
    });
    it("Should fail to delete payment with invalid ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .delete("/payment/invalid-id")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid ID");
    });
    it("Should fail to delete payment if not found", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .delete("/payment/99999") // Non-existent ID after initial deletion
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(404); // Controller returns 404 if existing check fails
        expect(res.body.message).toBe("Payment not found");
    });
});
