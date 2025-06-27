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
let testLocationId;
let testMaintenanceId;
let testCarId;
const adminUser = {
    firstName: "Admin",
    lastName: "Maintenance",
    email: "admin@maintenance.com",
    password: "AdminPass123",
    phoneNumber: "0711000001",
    address: "Admin Garage",
    role: "admin",
    isVerified: true,
};
const customerUser = {
    firstName: "Customer",
    lastName: "Maintenance",
    email: "customer@maintenance.com",
    password: "CustPass123",
    phoneNumber: "0700000001",
    address: "Customer Lane",
    role: "user",
    isVerified: true,
};
beforeAll(async () => {
    await db_1.default.delete(schema_1.CustomerTable);
    await db_1.default.delete(schema_1.MaintenanceTable);
    await db_1.default.delete(schema_1.CarTable);
    await db_1.default.delete(schema_1.LocationTable);
    const hashedAdminPassword = bcryptjs_1.default.hashSync(adminUser.password, 10);
    const [admin] = await db_1.default
        .insert(schema_1.CustomerTable)
        .values({ ...adminUser, password: hashedAdminPassword })
        .returning();
    adminId = admin.customerID;
    const hashedCustomerPassword = bcryptjs_1.default.hashSync(customerUser.password, 10);
    const [customer] = await db_1.default
        .insert(schema_1.CustomerTable)
        .values({ ...customerUser, password: hashedCustomerPassword })
        .returning();
    customerId = customer.customerID;
    const adminLogin = await (0, supertest_1.default)(src_1.default)
        .post("/auth/login")
        .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.token;
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
    // Create a test car for maintenance
    const [car] = await db_1.default
        .insert(schema_1.CarTable)
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
        await db_1.default.delete(schema_1.MaintenanceTable).where((0, drizzle_orm_1.eq)(schema_1.MaintenanceTable.maintenanceID, testMaintenanceId));
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
describe("Maintenance Controller Integration Tests", () => {
    it("Should register a maintenance ", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
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
        const [maintenance] = await db_1.default
            .select()
            .from(schema_1.MaintenanceTable)
            .where((0, drizzle_orm_1.eq)(schema_1.MaintenanceTable.carID, testCarId));
        expect(maintenance).toBeTruthy();
        testMaintenanceId = maintenance.maintenanceID;
    });
    it("Should fail to register maintenance without token", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
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
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/maintenances")
            .set("Authorization", `Bearer ${customerToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
    it("Should get maintenance by ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get(`/maintenance/${testMaintenanceId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty("maintenanceID", testMaintenanceId);
    });
    it("Should block customer from getting maintenance by ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get(`/maintenance/${testMaintenanceId}`)
            .set("Authorization", `Bearer ${customerToken}`);
        expect(res.statusCode).toBe(401);
    });
    it("Should update a maintenance record", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .put(`/maintenance/${testMaintenanceId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ description: "Updated oil change", cost: "2200.00" });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Maintenance updated successfully");
    });
    it("Should fail to update maintenance with invalid ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .put(`/maintenance/invalid`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ description: "Invalid update" });
        expect(res.statusCode).toBe(400);
    });
    it("Should delete a maintenance record", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .delete(`/maintenance/${testMaintenanceId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(204);
    });
    it("Should block customer from registering maintenance", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
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
