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
    const hashedPassword = bcryptjs_1.default.hashSync(testUser.password, 10);
    await db_1.default.insert(schema_1.CustomerTable).values({
        ...testUser,
        password: hashedPassword
    });
});
afterAll(async () => {
    await db_1.default.delete(schema_1.CustomerTable).where((0, drizzle_orm_1.eq)(schema_1.CustomerTable.email, testUser.email));
    //await db.$client.end()
});
describe("Post /auth/login", () => {
    it("should authenticate a user and return a token", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/auth/login")
            .send({
            email: testUser.email,
            password: testUser.password
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user).toEqual(expect.objectContaining({
            user_id: expect.any(Number),
            first_name: testUser.firstName,
            last_name: testUser.lastName,
            email: testUser.email
        }));
    });
    it("should fail with wrong password", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/auth/login")
            .send({
            email: testUser.email,
            password: "wrongpassword"
        });
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ message: "Invalid credentials" });
    });
    it("should fail with non-existent user", async () => {
        const res = await (0, supertest_1.default)(src_1.default)
            .post("/auth/login")
            .send({
            email: "nouser@mail.com",
            password: "irrelevant"
        });
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ message: "User not found" });
    });
});
