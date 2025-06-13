import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src';
import db from '../../src/drizzle/db'
import { CustomerTable } from '../../src/drizzle/schema';
import { eq } from 'drizzle-orm';

let customerID: number;

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
     await db.delete(CustomerTable);
    const hashedPassword = bcrypt.hashSync(testCustomer.password, 10);

    const [customer] = await db.insert(CustomerTable).values({
        firstName: testCustomer.firstName,
        lastName: testCustomer.lastName,
        email: testCustomer.email,
        password: hashedPassword,
        phoneNumber: testCustomer.phoneNumber,
        address: testCustomer.address,
        role: testCustomer.role as "admin" | "user", // Explicit cast if needed
        isVerified: testCustomer.isVerified
    }).returning();

    customerID = customer.customerID;

});

afterAll(async () => {
    await db.delete(CustomerTable).where(eq(CustomerTable.customerID, customerID));
    //await db.$client.end();
});

describe("Customer Controller Integration Tests", () => {
    it("Should get all customers", async () => {
        const res = await request(app)
            .get("/customers")

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
    });

    it("Should get a customer by ID", async () => {
        const res = await request(app)
            .get(`/customer/${customerID}`)

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
        const res = await request(app)
            .put(`/customer/${customerID}`)
            .send(update);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Customer updated successfully");
    });

    it("Should get customer bookings and payments", async () => {
        const res = await request(app)
            .get(`/customer/bookings-payments/${customerID}`)

        if (res.statusCode === 404) {
            expect(res.body.message).toBe("Customer not found.");
        } else {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("data");
        }
    });

    it("Should get all customers with bookings and payments", async () => {
        const res = await request(app)
            .get("/customers/bookings-payments")

        if (res.statusCode === 404) {
            expect(res.body.message).toBe("No customers with bookings and payments found.");
        } else {
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
        }
    });

    it("Should delete a customer", async () => {
        const [newCustomer] = await db.insert(CustomerTable).values({
            firstName: "Delete",
            lastName: "Me",
            email: "delete@me.com",
            password: bcrypt.hashSync("somepass", 10),
            phoneNumber: "0700000000",
            role: "admin",
            isVerified: true
        }).returning();

        const res = await request(app)
            .delete(`/customer/${newCustomer.customerID}`)

        expect(res.statusCode).toBe(204);
    });

    // NEGATIVE TESTS
    it("Should fail with invalid ID format", async () => {
        const res = await request(app)
            .get("/customer/invalid-id")

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid ID");
    });

    it("Should fail updating non-existent customer", async () => {
        const res = await request(app)
            .put("/customer/99999")
            .send({
                firstName: "Ghost",
                lastName: "Customer"
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Customer not found");
    });

    it("Should fail deleting non-existent customer", async () => {
        const res = await request(app)
            .delete("/customer/99999")

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Customer not found");
    });

});
