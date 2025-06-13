import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src';
import db from '../../src/drizzle/db'
import { CustomerTable } from '../../src/drizzle/schema';
import { eq } from 'drizzle-orm';

const testUser = {
    firstName: "Reg",
    lastName: "Tester",
    email: "registeruser@mail.com",
    password: "regpass123"
};

beforeAll(async () => {
    
    const hashedPassword = bcrypt.hashSync(testUser.password, 10)
    await db.insert(CustomerTable).values({
        ...testUser,
        password: hashedPassword
    })
})

afterAll(async () => {
   
    await db.delete(CustomerTable).where(eq(CustomerTable.email, testUser.email))
    //await db.$client.end()
})

describe("Post /auth/login", () => {
    it("should authenticate a user and return a token", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password
            })

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty("token")
        expect(res.body.user).toEqual(
            expect.objectContaining({
                user_id: expect.any(Number),
                first_name: testUser.firstName,
                last_name: testUser.lastName,
                email: testUser.email
            })
        )
    })

    it("should fail with wrong password", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: testUser.email,
                password: "wrongpassword"
            })

        expect(res.statusCode).toBe(401)
        expect(res.body).toEqual({ message: "Invalid credentials" })
    })

    it("should fail with non-existent user", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "nouser@mail.com",
                password: "irrelevant"
            })

        expect(res.statusCode).toBe(404)
        expect(res.body).toEqual({ message: "User not found" })
    })
})