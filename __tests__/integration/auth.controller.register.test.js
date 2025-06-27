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
const testUser = {
    firstName: "Reg",
    lastName: "Tester",
    email: "registeruser@mail.com",
    password: "regpass123"
};
beforeAll(async () => {
    await db_1.default.delete(schema_1.CustomerTable);
});
afterAll(async () => {
    // Clean up the test user
    await db_1.default.delete(schema_1.CustomerTable).where((0, drizzle_orm_1.eq)(schema_1.CustomerTable.email, testUser.email));
    //await db.$client.end();
});
describe("Post /auth/register", () => {
    it("should register a new user successfully", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/auth/register")
            // hash the password
            .send({
            ...testUser,
            password: bcryptjs_1.default.hashSync(testUser.password, 10)
        });
        // .send(testUser);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User created. Verification code sent to email.");
    });
    it("should not register a user with an existing email", async () => {
        // register the user again
        await (0, supertest_1.default)(src_1.default)
            .post("/auth/register")
            .send({
            ...testUser,
            password: bcryptjs_1.default.hashSync(testUser.password, 10)
        });
        // try to register the same user again
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/auth/register")
            .send({
            ...testUser,
            password: bcryptjs_1.default.hashSync(testUser.password, 10)
        });
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty("error");
    });
    it("should not register a user with missing fields", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/auth/register")
            .send({
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            email: testUser.email
            // missing password
        });
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty("error");
    });
});
