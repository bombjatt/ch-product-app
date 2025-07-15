import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { fetchNetSuiteInventoryItemsWithDetails } from "../utils/netsuite.server";

// Loader to fetch customers from NetSuite
export const loader = async () => {
  try {
    const customers = await fetchNetSuiteInventoryItemsWithDetails();
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
  <div className="min-h-screen p-6 bg-gray-100">
    <h1 className="text-2xl font-bold mb-6 text-center">📦 NetSuite Inventory Items</h1>

    {/* Inventory Table */}
    <div className="overflow-x-auto mb-6">
      <table className="netsuite-table min-w-full border border-gray-300 bg-white rounded shadow-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Sr No</th>
            <th className="border border-gray-300 px-4 py-2 text-left">🆔 ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">🆔 SKU/Item Number</th>
            <th className="border border-gray-300 px-4 py-2 text-left">📦 Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">🔖 UPC</th>
            <th className="border border-gray-300 px-4 py-2 text-left">📝 Website Description</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr key={customer.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{index + 1}</td> {/* Serial Number */}
              <td className="border border-gray-300 px-4 py-2">{customer.id}</td>
              <td className="border border-gray-300 px-4 py-2">{customer.externalId}</td>
              <td className="border border-gray-300 px-4 py-2">{customer.displayName || "N/A"}</td>
              <td className="border border-gray-300 px-4 py-2">{customer.upcCode || "N/A"}</td>
              <td className="border border-gray-300 px-4 py-2">
                {customer.custitem_ch_website_description || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Raw JSON Section */}
    <div className="bg-white border border-gray-300 rounded shadow-sm p-4 max-w-full overflow-x-auto">
      <h2 className="text-lg font-semibold mb-2">📄 Raw JSON Data</h2>
      <pre className="text-xs text-gray-800 whitespace-pre-wrap">
        {JSON.stringify(customers, null, 2)}
      </pre>
    </div>
  </div>
);








}
