"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../src/auth/auth.service");
const db_1 = __importDefault(require("../../src/drizzle/db"));
const schema_1 = require("../../src/drizzle/schema");
jest.mock("../../src/drizzle/db", () => ({
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
            const customer = {
                firstName: "Erica",
                lastName: "Nyaikamba",
                email: "erikapanda@gmail.com",
                password: "pass123",
                phoneNumber: "0700267677",
                address: "Nairobi CBD",
                role: "user"
            };
            db_1.default.insert.mockReturnValue({ values: jest.fn().mockResolvedValueOnce([{}]) });
            const result = await (0, auth_service_1.createCustomerService)(customer);
            expect(db_1.default.insert).toHaveBeenCalledWith(schema_1.CustomerTable);
            expect(result).toBe("Customer added successfully");
        });
    });
    describe("verifyCustomerService", () => {
        it("should update customer verification status", async () => {
            db_1.default.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValueOnce([{}])
                })
            });
            await (0, auth_service_1.verifyCustomerService)("erikapanda@gmail.com");
            expect(db_1.default.update).toHaveBeenCalledWith(schema_1.CustomerTable);
        });
    });
    describe("customerLoginService", () => {
        it("should return a logged-in customer", async () => {
            const foundCustomer = {
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
            db_1.default.query.CustomerTable.findFirst.mockResolvedValueOnce(foundCustomer);
            const loginInput = {
                email: "kansy841@gmail.com",
                password: "pass123"
            };
            const result = await (0, auth_service_1.customerLoginService)(loginInput);
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
            db_1.default.query.CustomerTable.findFirst.mockResolvedValueOnce(customerData);
            const result = await (0, auth_service_1.getCustomerWithBookingsAndPaymentsService)(1);
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
            db_1.default.query.CustomerTable.findMany.mockResolvedValueOnce(data);
            const result = await (0, auth_service_1.getAllCustomersWithBookingsAndPaymentsService)();
            expect(result).toEqual(data);
        });
    });
    describe("getCustomerService", () => {
        it("should return all customers", async () => {
            const customers = [{
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
            db_1.default.query.CustomerTable.findMany.mockResolvedValueOnce(customers);
            const result = await (0, auth_service_1.getCustomerService)();
            expect(result).toEqual(customers);
        });
    });
    describe("getCustomerByIdService", () => {
        it("should return customer by ID", async () => {
            // Mock data should be a single TSCustomer object
            const customer = {
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
            db_1.default.query.CustomerTable.findFirst.mockResolvedValueOnce(customer);
            const result = await (0, auth_service_1.getCustomerByIdService)(1);
            expect(result).toEqual(customer);
        });
    });
    describe("getCustomerByEmailService", () => {
        it("should return customer by email", async () => {
            const customer = {
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
            db_1.default.query.CustomerTable.findFirst.mockResolvedValueOnce(customer);
            const result = await (0, auth_service_1.getCustomerByEmailService)("hello@example.com");
            expect(result).toEqual(customer);
        });
    });
    describe("updateCustomerService", () => {
        it("should update customer and return success message", async () => {
            db_1.default.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValueOnce([{}]) })
                })
            });
            const result = await (0, auth_service_1.updateCustomerService)(1, {
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
            db_1.default.delete.mockReturnValue({
                where: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValueOnce([{}]) })
            });
            const result = await (0, auth_service_1.deleteCustomerService)(1);
            expect(result).toBe("Customer deleted successfully");
        });
    });
});
