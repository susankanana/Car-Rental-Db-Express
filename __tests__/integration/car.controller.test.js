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
const drizzle_orm_1 = require("drizzle-orm");
let adminToken;
let customerToken;
let adminId;
let customerId;
let testCarId;
const adminUser = {
    firstName: "Admin",
    lastName: "Tester",
    email: "admin@car.com",
    password: "AdminPass123",
    phoneNumber: "0712345678",
    address: "Admin Ave",
    role: "admin",
    isVerified: true,
};
const customerUser = {
    firstName: "Customer",
    lastName: "Tester",
    email: "customer@car.com",
    password: "CustPass123",
    phoneNumber: "0700112233",
    address: "Customer Rd",
    role: "user",
    isVerified: true,
};
beforeAll(async () => {
    await db_1.default.delete(schema_1.CarTable);
    await db_1.default.delete(schema_2.CustomerTable);
    // Create admin
    const hashedAdminPassword = bcryptjs_1.default.hashSync(adminUser.password, 10);
    const [admin] = await db_1.default
        .insert(schema_2.CustomerTable)
        .values({ ...adminUser, password: hashedAdminPassword })
        .returning();
    adminId = admin.customerID;
    // Create customer
    const hashedCustomerPassword = bcryptjs_1.default.hashSync(customerUser.password, 10);
    const [customer] = await db_1.default
        .insert(schema_2.CustomerTable)
        .values({ ...customerUser, password: hashedCustomerPassword })
        .returning();
    customerId = customer.customerID;
    // Login admin
    const adminLogin = await (0, supertest_1.default)(src_1.default)
        .post("/auth/login")
        .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.token;
    // Login customer
    const customerLogin = await (0, supertest_1.default)(src_1.default)
        .post("/auth/login")
        .send({ email: customerUser.email, password: customerUser.password });
    customerToken = customerLogin.body.token;
});
afterAll(async () => {
    await db_1.default.delete(schema_1.CarTable).where((0, drizzle_orm_1.eq)(schema_1.CarTable.carID, testCarId));
    await db_1.default.delete(schema_2.CustomerTable).where((0, drizzle_orm_1.eq)(schema_2.CustomerTable.customerID, adminId));
    await db_1.default.delete(schema_2.CustomerTable).where((0, drizzle_orm_1.eq)(schema_2.CustomerTable.customerID, customerId));
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
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/car/register")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(carData);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message");
        expect(typeof res.body.message).toBe("string");
        const createdCar = await db_1.default.query.CarTable.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.CarTable.carModel, carData.carModel),
        });
        expect(createdCar).toBeTruthy();
        testCarId = createdCar.carID;
    });
    it("Should fail to create a car without token", async () => {
        const res = await (0, supertest_1.default)(src_1.default).post("/car/register").send({
            carModel: "Mazda Demio",
            year: "2020-02-02",
            color: "Blue",
            rentalRate: "1100.00",
        });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Unauthorized");
    });
    it("Should get all cars", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/cars")
            .set("Authorization", `Bearer ${customerToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
    it("Should get a car by ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get(`/car/${testCarId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty("carID", testCarId);
    });
    it("Should get bookings for a car", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get(`/car-bookings/${testCarId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        // Even if no bookings exist, the status should be 200 with car info
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("carModel", "Honda Fit");
    });
    it("Should update a car", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
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
        const res = await (0, supertest_1.default)(src_1.default)
            .delete(`/car/${testCarId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(204);
    });
    it("Should block access without token", async () => {
        const res = await (0, supertest_1.default)(src_1.default).get("/cars");
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Unauthorized");
    });
});
