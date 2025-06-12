import request from "supertest";
import { eq } from "drizzle-orm";
import db from "../../src/drizzle/db";
import { CustomerTable, CarTable, ReservationTable,   LocationTable } from "../../src/drizzle/schema";
import app from "../../src"; 
import bcrypt from "bcryptjs";

let adminToken: string;
let customerToken: string;
let adminId: number;
let customerId: number;
let testLocationId: number;
let testCarId: number;
let testReservationId: number; // For general tests (get, update)
let testReservationIdToDelete: number; // Specifically for the delete test
let testReservationIdForUserDeleteFail: number; // For the "fail to delete as user" test

const adminUser = {
  firstName: "Admin",
  lastName: "Reservation",
  email: "admin.res@example.com",
  password: "AdminPass123",
  phoneNumber: "0711000001",
  address: "Admin HQ",
  role: "admin" as const,
  isVerified: true,
};

const customerUser = {
  firstName: "Customer",
  lastName: "Reservation",
  email: "customer.res@example.com",
  password: "CustPass123",
  phoneNumber: "0700000001",
  address: "Customer Home",
  role: "user" as const,
  isVerified: true,
};

beforeAll(async () => {
  // Clean up existing data before tests (important for isolated tests)
  await db.delete(ReservationTable);
  await db.delete(CarTable);
  await db.delete(LocationTable);
  await db.delete(CustomerTable); // Delete customers last as they are referenced


  // Create a test admin user in CustomerTable
  const hashedAdminPassword = bcrypt.hashSync(adminUser.password, 10);
  const [admin] = await db
    .insert(CustomerTable)
    .values({ ...adminUser, password: hashedAdminPassword })
    .returning();
  adminId = admin.customerID;

  // Create a test customer user in CustomerTable
  const hashedCustomerPassword = bcrypt.hashSync(customerUser.password, 10);
  const [customer] = await db
    .insert(CustomerTable)
    .values({ ...customerUser, password: hashedCustomerPassword })
    .returning();
  customerId = customer.customerID;

  // Log in admin to get token
  const adminLogin = await request(app)
    .post("/auth/login")
    .send({ email: adminUser.email, password: adminUser.password });
  adminToken = adminLogin.body.token;

  // Log in customer to get token
  const customerLogin = await request(app)
    .post("/auth/login")
    .send({ email: customerUser.email, password: customerUser.password });
  customerToken = customerLogin.body.token;

  //Create test location
  const [location] = await db
    .insert(LocationTable)
    .values({
      locationName: "Reservation Test Location",
      address: "123 Reservation St",
      contactNumber: "0700112233",
    })
    .returning();
  testLocationId = location.locationID;

  // Create a test car for reservations
  const [car] = await db
    .insert(CarTable)
    .values({
      carModel: "Test Car Model for Reservation",
      year: "2023-01-01", // Assuming your schema stores date as YYYY-MM-DD
      color: "Green",
      rentalRate: "3000.00",
      availability: true,
      locationID: testLocationId, 
    })
    .returning();
  testCarId = car.carID;

  // Create a test reservation to be used by other tests (e.g., get by ID, update)
  const [reservation] = await db
    .insert(ReservationTable)
    .values({
      customerID: customerId,
      carID: testCarId,
      reservationDate: "2025-06-10",
      pickupDate: "2025-06-12",
      returnDate: "2025-06-15",
    })
    .returning();
  testReservationId = reservation.reservationID;

  // Create another test reservation specifically for the delete test
  const [reservationToDelete] = await db
    .insert(ReservationTable)
    .values({
      customerID: customerId,
      carID: testCarId,
      reservationDate: "2025-06-10",
      pickupDate: "2025-06-13",
      returnDate: "2025-06-16",
    })
    .returning();
  testReservationIdToDelete = reservationToDelete.reservationID;

  // Create another test reservation for the "fail to delete as user" test
  const [resForUserDeleteFail] = await db
    .insert(ReservationTable)
    .values({
      customerID: customerId,
      carID: testCarId,
      reservationDate: "2025-06-10",
      pickupDate: "2025-06-14",
      returnDate: "2025-06-17",
    })
    .returning();
  testReservationIdForUserDeleteFail = resForUserDeleteFail.reservationID;
});

afterAll(async () => {
  // Clean up data after all tests
  if (testReservationId) {
    await db.delete(ReservationTable).where(eq(ReservationTable.reservationID, testReservationId));
  }
  if (testReservationIdToDelete) {
    await db.delete(ReservationTable).where(eq(ReservationTable.reservationID, testReservationIdToDelete));
  }
  if (testReservationIdForUserDeleteFail) {
    await db.delete(ReservationTable).where(eq(ReservationTable.reservationID, testReservationIdForUserDeleteFail));
  }
  if (testCarId) {
    await db.delete(CarTable).where(eq(CarTable.carID, testCarId));
  }
  if (adminId) {
    await db.delete(CustomerTable).where(eq(CustomerTable.customerID, adminId));
  }
  if (customerId) {
    await db.delete(CustomerTable).where(eq(CustomerTable.customerID, customerId));
  }
  if (testLocationId) {
    await db.delete(CarTable).where(eq(CarTable.locationID, testLocationId));
  }

});

describe("Reservation Controller Integration Tests", () => {
  describe("POST /reservation/register", () => {
    it("Should create a reservation as a user (customer)", async () => {
      const futurePickupDate = new Date();
      futurePickupDate.setDate(futurePickupDate.getDate() + 7);
      const futureReturnDate = new Date();
      futureReturnDate.setDate(futureReturnDate.getDate() + 10);

      const res = await request(app)
        .post("/reservation/register")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          customerID: customerId,
          carID: testCarId,
          reservationDate: new Date().toISOString().split('T')[0],
          pickupDate: futurePickupDate.toISOString().split('T')[0],
          returnDate: futureReturnDate.toISOString().split('T')[0],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Reservation created successfully");
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveProperty("reservationID");
      expect(res.body.data.customerID).toBe(customerId);
      expect(res.body.data.carID).toBe(testCarId);

      // Verify it exists in the DB, using res.body.data.reservationID
      const [newReservation] = await db
        .select()
        .from(ReservationTable)
        .where(eq(ReservationTable.reservationID, res.body.data.reservationID));
      expect(newReservation).toBeDefined();
    });

    it("Should fail to create a reservation without token", async () => {
      const res = await request(app)
        .post("/reservation/register")
        .send({
          customerID: customerId,
          carID: testCarId,
          reservationDate: "2025-07-01",
          pickupDate: "2025-07-05",
          returnDate: "2025-07-10",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });

    it("Should fail to create a reservation as an admin (forbidden)", async () => {
      const res = await request(app)
        .post("/reservation/register")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          customerID: customerId,
          carID: testCarId,
          reservationDate: "2025-07-01",
          pickupDate: "2025-07-05",
          returnDate: "2025-07-10",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });

    it("Should fail to create a reservation with invalid data (e.g., missing carID)", async () => {
        const res = await request(app)
          .post("/reservation/register")
          .set("Authorization", `Bearer ${customerToken}`)
          .send({
            customerID: customerId,
            // carID is missing
            reservationDate: "2025-07-01",
            pickupDate: "2025-07-05",
            returnDate: "2025-07-10",
          });

        expect(res.statusCode).toBe(500); // Or 400 if your validation handles it gracefully
        expect(res.body.error).toBeDefined(); // Assuming error property exists
    });
  });

  describe("GET /reservations", () => {
    it("Should get all reservations as an admin", async () => {
      const res = await request(app)
        .get("/reservations")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data[0]).toHaveProperty("reservationID");
    });

    it("Should fail to get all reservations as a user (forbidden)", async () => {
      const res = await request(app)
        .get("/reservations")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });

    it("Should fail to get all reservations without token", async () => {
      const res = await request(app).get("/reservations");

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });
  });

  describe("GET /reservation/:id", () => {
    it("Should get a reservation by ID as an admin", async () => {
      const res = await request(app)
        .get(`/reservation/${testReservationId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty("reservationID", testReservationId);
      expect(res.body.data.customerID).toBe(customerId);
    });

    it("Should fail to get a reservation by ID with invalid ID", async () => {
      const res = await request(app)
        .get("/reservation/abc") // Invalid ID format
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid ID");
    });

    it("Should fail to get a reservation by ID if not found", async () => {
      const res = await request(app)
        .get("/reservation/999999999") // Non-existent ID
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Reservation not found");
    });

    it("Should fail to get a reservation by ID as a user (forbidden)", async () => {
      const res = await request(app)
        .get(`/reservation/${testReservationId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });
  });

  describe("GET /reservations/customer/:customerID", () => {
    it("Should get reservations by customer ID as a user (customer)", async () => {
      const res = await request(app)
        .get(`/reservations/customer/${customerId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].customerID).toBe(customerId);
    });

    it("Should fail to get reservations by customer ID with invalid ID", async () => {
      const res = await request(app)
        .get("/reservations/customer/abc") // Invalid ID format
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid ID");
    });

    it("Should fail to get reservations by customer ID if not found", async () => {
      const res = await request(app)
        .get("/reservations/customer/999999999") // Non-existent Customer ID
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it("Should fail to get reservations by customer ID as an admin (forbidden)", async () => {
      const res = await request(app)
        .get(`/reservations/customer/${customerId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized"); 
    });
  });

  describe("PUT /reservation/:id", () => {
    it("Should update a reservation as both admin or user", async () => {
      const updatedReturnDate = new Date();
      updatedReturnDate.setDate(updatedReturnDate.getDate() + 15); // 15 days from now
      const formattedDate = updatedReturnDate.toISOString().split('T')[0];

      const res = await request(app)
        .put(`/reservation/${testReservationId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ returnDate: formattedDate });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Reservation updated successfully");

      // Verify update in DB
      const [updatedReservation] = await db
        .select()
        .from(ReservationTable)
        .where(eq(ReservationTable.reservationID, testReservationId));

      expect(updatedReservation.returnDate).toBe(formattedDate);
    });

    it("Should fail to update reservation with invalid ID", async () => {
      const res = await request(app)
        .put("/reservation/abc") // Invalid ID format
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ returnDate: "2025-08-01" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid ID");
    });

    it("Should fail to update reservation if not found", async () => {
      const res = await request(app)
        .put("/reservation/999999999") // Non-existent ID
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ returnDate: "2025-08-01" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Reservation not found");
    });

    it("Should fail to update a reservation without token", async () => {
      const res = await request(app)
        .put(`/reservation/${testReservationId}`)
        .send({ returnDate: "2025-08-01" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized"); 
    });
  });

  describe("DELETE /reservation/:id", () => {
    it("Should delete a reservation as an admin", async () => {
      const res = await request(app)
        .delete(`/reservation/${testReservationIdToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);
      expect(res.body).toEqual({}); // 204 No Content typically has no body, so it's an empty object
    });

    it("Should fail to delete reservation with invalid ID", async () => {
      const res = await request(app)
        .delete("/reservation/abc") // Invalid ID format
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid ID");
    });

    it("Should fail to delete reservation if not found", async () => {
      const res = await request(app)
        .delete("/reservation/999999999") // Non-existent ID
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Reservation not found");
    });

    it("Should fail to delete a reservation as a user (forbidden)", async () => {
      const res = await request(app)
        .delete(`/reservation/${testReservationIdForUserDeleteFail}`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized"); 
    });

    it("Should fail to delete a reservation without token", async () => {
      const res = await request(app)
        .delete(`/reservation/${testReservationIdToDelete}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });
  });
});