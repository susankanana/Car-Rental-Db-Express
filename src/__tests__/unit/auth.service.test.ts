import {
  createCustomerService,
  verifyCustomerService,
  customerLoginService,
  getCustomerWithBookingsAndPaymentsService,
  getAllCustomersWithBookingsAndPaymentsService,
  getCustomerService,
  getCustomerByIdService,
  getCustomerByEmailService,
  updateCustomerService,
  deleteCustomerService
} from "../../auth/auth.service";
import db from "../../../src/drizzle/db";
import { CustomerTable, TICustomer, TSCustomer, TSCustomerLoginInput } from "../../drizzle/schema";

jest.mock("../../../src/drizzle/db", () => ({
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  query: {
    CustomerTable: {
      findFirst: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Customer Service", () => {
  describe("createCustomerService", () => {
    it("should insert a customer and return success message", async () => {
      const customer: TICustomer = { // explicitly tell TypeScript that your customer object conforms to the TICustomer type. This will enforce the correct type for role at the point of creation.
                firstName: "Erica",
                lastName: "Nyaikamba",
                email: "erikapanda@gmail.com",
                password: "pass123",
                phoneNumber: "0700267677", 
                address: "Nairobi CBD",
                role: "user"
            };

      (db.insert as jest.Mock).mockReturnValue({ values: jest.fn().mockResolvedValueOnce([{}]) });

      const result = await createCustomerService(customer);
      expect(db.insert).toHaveBeenCalledWith(CustomerTable);
      expect(result).toBe("Customer added successfully");
    });
  });

  describe("verifyCustomerService", () => {
    it("should update customer verification status", async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValueOnce([{}])
        })
      });

      await verifyCustomerService("erikapanda@gmail.com");
      expect(db.update).toHaveBeenCalledWith(CustomerTable);
    });
  });

  describe("customerLoginService", () => {
    it("should return a logged-in customer", async () => {
      const foundCustomer: TSCustomer = { 
                customerID: 3,
                firstName: "Kansy",
                lastName: "Sue",
                email: "kansy841@gmail.com",
                password: "mocked_hashed_password_from_db_abc123",
                phoneNumber: "0790519306", 
                address: "Nairobi CBD",
                role: "user",
                isVerified: true,
                verificationCode: null 
             };

      (db.query.CustomerTable.findFirst as jest.Mock).mockResolvedValueOnce(foundCustomer);
       const loginInput: TSCustomerLoginInput = {
            email: "kansy841@gmail.com",
            password: "pass123"
        };
      const result = await customerLoginService(loginInput);
      expect(result).toEqual(foundCustomer);
    });
  });

  describe("getCustomerWithBookingsAndPaymentsService", () => {
    it("should return customer with bookings and payments", async () => {
      const customerData = {
        firstName: "Erica",
        lastName: "Nyaikamba",
        bookings: [
          {
            bookingID: 1,
            rentalStartDate: new Date().toISOString(),
            rentalEndDate: new Date().toISOString(),
            totalAmount: "100.00",
            payments: []
          }
        ]
      };
      (db.query.CustomerTable.findFirst as jest.Mock).mockResolvedValueOnce(customerData);

      const result = await getCustomerWithBookingsAndPaymentsService(1);
      expect(result).toEqual(customerData);
    });
  });

 describe("getAllCustomersWithBookingsAndPaymentsService", () => {
    it("should return all customers with bookings and payments", async () => {
        const data = [
            {
                firstName: "Kansy",
                lastName: "Sue",
                bookings: [
                    {
                        bookingID: 2,
                        rentalStartDate: new Date().toISOString(),
                        rentalEndDate: new Date().toISOString(),
                        totalAmount: "200.00",
                        payments: []
                    }
                ]
            },
            {
                firstName: "Erica",
                lastName: "Nyaikamba",
                bookings: [
                    {
                        bookingID: 1,
                        rentalStartDate: new Date().toISOString(),
                        rentalEndDate: new Date().toISOString(),
                        totalAmount: "100.00",
                        payments: []
                    }
                ]
            } 
        ]; 

        (db.query.CustomerTable.findMany as jest.Mock).mockResolvedValueOnce(data);
        const result = await getAllCustomersWithBookingsAndPaymentsService();
        expect(result).toEqual(data);
    });
});

  describe("getCustomerService", () => {
    it("should return all customers", async () => {
       
        const customers: TSCustomer[] = [{
            customerID: 1,
            firstName: "Kansy",
            lastName: "Sue",
            email: "kansy841.com", 
            phoneNumber: "0700267677", 
            address: "Nyeri Boma",     
            password: "hashed_password_1", 
            role: "admin",     
            isVerified: true, 
            verificationCode: null 
        }, {
            customerID: 2,
            firstName: "Erica",
            lastName: "Nyaikamba",
            email: "erikapanda@gmail.com",
            phoneNumber: "0700267677",
            address: "Nairobi CBD",
            password: "hashed_password_2",
            role: "user",
            isVerified: false,
            verificationCode: "AB0975"
        }];

        (db.query.CustomerTable.findMany as jest.Mock).mockResolvedValueOnce(customers);

        const result = await getCustomerService();
        expect(result).toEqual(customers);
    });
});

  describe("getCustomerByIdService", () => {
    it("should return customer by ID", async () => {
        // Mock data should be a single TSCustomer object
        const customer: TSCustomer = {
            customerID: 1,
            firstName: "Kansy",
            lastName: "Sue",
            email: "kansy841.com", 
            phoneNumber: "0700267677", 
            address: "Nyeri Boma",     
            password: "hashed_password_1", 
            role: "admin",     
            isVerified: true, 
            verificationCode: null 
        };

        (db.query.CustomerTable.findFirst as jest.Mock).mockResolvedValueOnce(customer);

        const result = await getCustomerByIdService(1);
        expect(result).toEqual(customer);
    });
});

  describe("getCustomerByEmailService", () => {
    it("should return customer by email", async () => {
      const customer: TSCustomer = {
            customerID: 1,
            firstName: "Kansy",
            lastName: "Sue",
            email: "kansy841.com", 
            phoneNumber: "0700267677", 
            address: "Nyeri Boma",     
            password: "hashed_password_1", 
            role: "admin",     
            isVerified: true, 
            verificationCode: null 
        };
      (db.query.CustomerTable.findFirst as jest.Mock).mockResolvedValueOnce(customer);

      const result = await getCustomerByEmailService("hello@example.com");
      expect(result).toEqual(customer);
    });
  });

  describe("updateCustomerService", () => {
    it("should update customer and return success message", async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValueOnce([{}]) })
        })
      });

      const result = await updateCustomerService(1, {
        firstName: "Susan",
        lastName: "Kanana",
        email: "suzzannekans@gmail.com",
        password: "pass123",
        role: "admin"
      });
      expect(result).toBe("Customer updated successfully");
    });
  });

  describe("deleteCustomerService", () => {
    it("should delete customer and return success message", async () => {
      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValueOnce([{}]) })
      });

      const result = await deleteCustomerService(1);
      expect(result).toBe("Customer deleted successfully");
    });
  });
});
