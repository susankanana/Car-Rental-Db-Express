"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const src_1 = __importDefault(require("../../src"));
const db_1 = __importDefault(require("../../src/drizzle/db"));
const schema_1 = require("../../src/drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let customerID;
const testCustomer = {
    firstName: "Test",
    lastName: "Customer",
    email: "customer@test.com",
    password: "securePass123",
    phoneNumber: "0712345678",
    address: "123 Test Street",
    role: "admin",
    isVerified: true
};
beforeAll(async () => {
    await db_1.default.delete(schema_1.CustomerTable);
    const hashedPassword = bcryptjs_1.default.hashSync(testCustomer.password, 10);
    const [customer] = await db_1.default.insert(schema_1.CustomerTable).values({
        firstName: testCustomer.firstName,
        lastName: testCustomer.lastName,
        email: testCustomer.email,
        password: hashedPassword,
        phoneNumber: testCustomer.phoneNumber,
        address: testCustomer.address,
        role: testCustomer.role, // Explicit cast if needed
        isVerified: testCustomer.isVerified
    }).returning();
    customerID = customer.customerID;
});
afterAll(async () => {
    await db_1.default.delete(schema_1.CustomerTable).where((0, drizzle_orm_1.eq)(schema_1.CustomerTable.customerID, customerID));
    //await db.$client.end();
});
describe("Customer Controller Integration Tests", () => {
    it("Should get all customers", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/customers");
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
    });
    it("Should get a customer by ID", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get(`/customer/${customerID}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty("customerID", customerID);
    });
    it("Should update a customer", async () => {
        const update = {
            firstName: "Updated",
            lastName: "Customer",
            phoneNumber: "0799999999",
            address: "Updated Address"
        };
        const res = await (0, supertest_1.default)(src_1.default)
            .put(`/customer/${customerID}`)
            .send(update);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Customer updated successfully");
    });
    it("Should get customer bookings and payments", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get(`/customer/bookings-payments/${customerID}`);
        if (res.statusCode === 404) {
            expect(res.body.message).toBe("Customer not found.");
        }
        else {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("data");
        }
    });
    it("Should get all customers with bookings and payments", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/customers/bookings-payments");
        if (res.statusCode === 404) {
            expect(res.body.message).toBe("No customers with bookings and payments found.");
        }
        else {
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        }
    });
    it("Should delete a customer", async () => {
        const [newCustomer] = await db_1.default.insert(schema_1.CustomerTable).values({
            firstName: "Delete",
            lastName: "Me",
            email: "delete@me.com",
            password: bcryptjs_1.default.hashSync("somepass", 10),
            phoneNumber: "0700000000",
            role: "admin",
            isVerified: true
        }).returning();
        const res = await (0, supertest_1.default)(src_1.default)
            .delete(`/customer/${newCustomer.customerID}`);
        expect(res.statusCode).toBe(204);
    });
    // NEGATIVE TESTS
    it("Should fail with invalid ID format", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .get("/customer/invalid-id");
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid ID");
    });
    it("Should fail updating non-existent customer", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .put("/customer/99999")
            .send({
            firstName: "Ghost",
            lastName: "Customer"
        });
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Customer not found");
    });
    it("Should fail deleting non-existent customer", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .delete("/customer/99999");
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Customer not found");
    });
});
