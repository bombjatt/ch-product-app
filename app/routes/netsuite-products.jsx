import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { fetchNetSuiteCustomers } from "../utils/netsuite.server";

// Loader to fetch customers from NetSuite
export const loader = async () => {
  try {
    const customers = await fetchNetSuiteCustomers();
    console.log("✅ Invetory Items fetched:", customers);

    return json({ success: true, customers });
  } catch (error) {
    console.error("❌ API Route Error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};

export default function NetsuiteCustomers() {
  const { customers, error, success } = useLoaderData();

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h1 className="text-xl font-bold">Error Fetching Customers</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!success || !customers  || customers.length === 0) {
    return (
      <div className="p-4 text-gray-600">
        <h1 className="text-xl font-semibold">NetSuite Inventory Items</h1>
        <p>No Products found in NetSuite.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">NetSuite Inventory Items</h1>
      <ul className="space-y-2">
        {customers.map((customer) => (
          <li
            key={customer.id}
            className="border p-3 rounded shadow-sm hover:shadow-md transition"
          >
            <div>
              <strong>ID:</strong> {customer.id}
            </div>
            <div>
              <strong>Company Name:</strong>{" "}
              {customer.companyName || "N/A"}
            </div>
            <div>
              <strong>Email:</strong> {customer.email || "N/A"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
