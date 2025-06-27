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
let testCarId;
let testInsuranceId;
const adminUser = {
    firstName: "Admin",
    lastName: "Tester",
    email: "admin@insurance.com",
    password: "AdminPass123",
    phoneNumber: "0711223344",
    address: "Admin St",
    role: "admin",
    isVerified: true,
};
const customerUser = {
    firstName: "Customer",
    lastName: "Tester",
    email: "customer@insurance.com",
    password: "CustPass123",
    phoneNumber: "0700112233",
    address: "Customer Ave",
    role: "user",
    isVerified: true,
};
beforeAll(async () => {
    await db_1.default.delete(schema_1.InsuranceTable);
    await db_1.default.delete(schema_1.CarTable);
    await db_1.default.delete(schema_1.CustomerTable);
    const hashedAdminPassword = bcryptjs_1.default.hashSync(adminUser.password, 10);
    const [admin] = await db_1.default.insert(schema_1.CustomerTable).values({ ...adminUser, password: hashedAdminPassword }).returning();
    adminId = admin.customerID;
    const hashedCustomerPassword = bcryptjs_1.default.hashSync(customerUser.password, 10);
    const [customer] = await db_1.default.insert(schema_1.CustomerTable).values({ ...customerUser, password: hashedCustomerPassword }).returning();
    customerId = customer.customerID;
    const adminLogin = await (0, supertest_1.default)(src_1.default)
        .post("/auth/login")
        .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.token;
    const customerLogin = await (0, supertest_1.default)(src_1.default)
        .post("/auth/login")
        .send({ email: customerUser.email, password: customerUser.password });
    customerToken = customerLogin.body.token;
    const [car] = await db_1.default.insert(schema_1.CarTable).values({
        carModel: "Toyota Premio",
        year: "2020-01-01",
        color: "White",
        rentalRate: "1000.00",
        availability: true,
    }).returning();
    testCarId = car.carID;
});
afterAll(async () => {
    await db_1.default.delete(schema_1.InsuranceTable).where((0, drizzle_orm_1.eq)(schema_1.InsuranceTable.insuranceID, testInsuranceId));
    await db_1.default.delete(schema_1.CarTable).where((0, drizzle_orm_1.eq)(schema_1.CarTable.carID, testCarId));
    await db_1.default.delete(schema_1.CustomerTable).where((0, drizzle_orm_1.eq)(schema_1.CustomerTable.customerID, adminId));
    await db_1.default.delete(schema_1.CustomerTable).where((0, drizzle_orm_1.eq)(schema_1.CustomerTable.customerID, customerId));
});
describe("Insurance Controller Integration Tests", () => {
    it("Should register insurance (admin only)", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/insurance/register")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
            carID: testCarId,
            insuranceProvider: "Jubilee",
            policyNumber: "POL12345678",
            startDate: "2024-01-01",
            endDate: "2025-01-01"
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBeDefined();
        const insurance = await db_1.default.query.InsuranceTable.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.InsuranceTable.policyNumber, "POL12345678")
        });
        expect(insurance).toBeTruthy();
        testInsuranceId = insurance.insuranceID;
    });
    it("Should fail to register insurance without token", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/insurance/register")
            .send({
            carID: testCarId,
            insuranceProvider: "Britam",
            policyNumber: "POL99999999",
            startDate: "2024-01-01",
            endDate: "2025-01-01"
        });
        expect(res.statusCode).toBe(401);
    });
    it("Should fetch all insurances", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/insurances")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
    it("Should get insurance by ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get(`/insurance/${testInsuranceId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty("insuranceID", testInsuranceId);
    });
    it("Should update insurance", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .put(`/insurance/${testInsuranceId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ insuranceProvider: "CIC Insurance" });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Insurance updated successfully");
    });
    it("Should delete insurance", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .delete(`/insurance/${testInsuranceId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(204);
    });
    it("Should block customer from accessing insurance routes", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/insurances")
            .set("Authorization", `Bearer ${customerToken}`);
        expect(res.statusCode).toBe(401);
    });
});
