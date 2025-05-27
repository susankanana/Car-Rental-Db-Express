import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TICustomer, CustomerTable } from "../drizzle/schema";

export const createCustomerService = async (user: TICustomer) => {
    await db.insert(CustomerTable).values(user);
    return "Customer added successfully";
}
// get all customers 
export const getCustomerService = async () => {
    const customers = await db.query.CustomerTable.findMany();
    return customers;
}

// get customer by id
export const getCustomerByIdService = async (id: number) => {
    const customer = await db.query.CustomerTable.findFirst({
        where: eq(CustomerTable.customerID, id)
    })
    return customer;
}

// update customer by id
export const updateCustomerService = async (id: number, customer: TICustomer) => {
    await db.update(CustomerTable).set(customer).where(eq(CustomerTable.customerID, id)).returning();
    return "Customer updated successfully";
}

// delete customer by id
export const deleteCustomerService = async (id: number) => {
    await db.delete(CustomerTable).where(eq(CustomerTable.customerID, id)).returning();
    return "Customer deleted successfully";
}