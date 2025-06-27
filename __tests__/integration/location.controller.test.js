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
const adminUser = {
    firstName: "Admin",
    lastName: "Location",
    email: "admin@location.com",
    password: "AdminPass123",
    phoneNumber: "0711000000",
    address: "Admin Lane",
    role: "admin",
    isVerified: true,
};
const customerUser = {
    firstName: "Customer",
    lastName: "Location",
    email: "customer@location.com",
    password: "CustPass123",
    phoneNumber: "0700000000",
    address: "Customer Street",
    role: "user",
    isVerified: true,
};
beforeAll(async () => {
    await db_1.default.delete(schema_1.LocationTable);
    await db_1.default.delete(schema_1.CustomerTable);
    const [location] = await db_1.default
        .insert(schema_1.LocationTable)
        .values({
        locationName: "Reservation Test Location",
        address: "123 Reservation St",
        contactNumber: "0700112233",
    })
        .returning();
    testLocationId = location.locationID;
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
});
afterAll(async () => {
    if (testLocationId) {
        await db_1.default.delete(schema_1.LocationTable).where((0, drizzle_orm_1.eq)(schema_1.LocationTable.locationID, testLocationId));
    }
    await db_1.default.delete(schema_1.CustomerTable).where((0, drizzle_orm_1.eq)(schema_1.CustomerTable.customerID, adminId));
    await db_1.default.delete(schema_1.CustomerTable).where((0, drizzle_orm_1.eq)(schema_1.CustomerTable.customerID, customerId));
});
describe("Location Controller Integration Tests", () => {
    it("Should register a location", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/location/register")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
            locationName: "Nairobi Central",
            address: "Moi Avenue",
            contactNumber: "0722001122",
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBeDefined();
        const location = await db_1.default.query.LocationTable.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.LocationTable.locationName, "Nairobi Central"),
        });
        expect(location).toBeTruthy();
        //testLocationId = location!.locationID;
    });
    it("Should fail to register a location without token", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/location/register")
            .send({
            locationName: "Unauthorized Place",
            address: "No Auth Street",
            contactNumber: "0733445566",
        });
        expect(res.statusCode).toBe(401);
    });
    it("Should get all locations", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/locations")
            .set("Authorization", `Bearer ${customerToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
    it("Should get location by ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get(`/location/${testLocationId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty("locationID", testLocationId);
    });
    it("Should block user from getting location by ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get(`/location/${testLocationId}`)
            .set("Authorization", `Bearer ${customerToken}`);
        expect(res.statusCode).toBe(401);
    });
    it("Should get location with cars", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get(`/locations-cars/${testLocationId}`)
            .set("Authorization", `Bearer ${customerToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("locationName");
        expect(res.body).toHaveProperty("cars");
    });
    it("Should update a location ", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .put(`/location/${testLocationId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ contactNumber: "0799111222" });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Location updated successfully");
    });
    it("Should fail to update location with invalid ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .put(`/location/invalid`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ contactNumber: "0799111222" });
        expect(res.statusCode).toBe(400);
    });
    it("Should delete location", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .delete(`/location/${testLocationId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(204);
    });
    it("Should block customer from registering location", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
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
