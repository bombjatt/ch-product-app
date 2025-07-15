// app/routes/netsuite-shopify-sync.jsx

import { json } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { fetchNetSuiteInventoryItemsWithDetails } from "../utils/netsuite.server";
import { updateShopifyProduct } from "../utils/shopify-utils.server";

// ✅ Loader for GET requests
export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    // Fetch metafields for testing + display type
    const productGID = "gid://shopify/Product/7940572217401"; // replace with your mapped GID

    const metafieldsQuery = `
      query FetchProductMetafields($id: ID!) {
        product(id: $id) {
          title
          metafields(first: 10) {
            edges {
              node {
                id
                namespace
                key
                type
                value
              }
            }
          }
        }
      }
    `;

    const response = await admin.graphql(metafieldsQuery, {
      variables: { id: productGID },
    });

    const data = await response.json();

    const metafields =
      data?.data?.product?.metafields?.edges?.map((edge) => edge.node) || [];

    return json({
      message:
        "यह पेज NetSuite से डेटा लाकर Shopify में डालने के लिए तैयार है। नीचे बटन दबाकर सिंक चालू करें।",
      metafields,
      productTitle: data?.data?.product?.title || "Product",
    });
  } catch (error) {
    console.error("❌ Loader Error:", error);
    return json({
      message: "Metafields fetch में त्रुटि हुई।",
      metafields: [],
      error: error.message,
    });
  }
};

// ✅ Action for POST requests
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // ✅ Fetch customers (or inventory items) from NetSuite
  const netsuiteData = await fetchNetSuiteInventoryItemsWithDetails();

  const results = [];

  console.log("🔹 Received NetSuite Data:", JSON.stringify(netsuiteData, null, 2));

  const itemsToSync = netsuiteData || [];

  if (itemsToSync.length === 0) {
    return json({ success: false, message: "NetSuite से कोई डेटा प्राप्त नहीं हुआ।" });
  }

  for (const item of itemsToSync) {
    const title = item.displayName || item.itemId || "NS Product Again";
    const netsuiteId = item.id;

    const productGID = "gid://shopify/Product/7940572217401";

    const metafieldData = {
      namespace: "custom",
      key: "ns_id",
      type: "single_line_text_field",
      value: String(netsuiteId),
      ownerId: productGID,
    };

    try {
      const result = await updateShopifyProduct({
        admin,
        productId: productGID,
        title,
        metafieldData,
      });

      console.log("✅ Updated product:", result);
      results.push({ success: true, data: result });
    } catch (error) {
      console.error("❌ Error syncing product:", error);
      results.push({ success: false, error: error.message });
    }
  }

  return json({ success: true, results });
};

// ✅ React Component
export default function NetsuiteShopifySync() {
  const loaderData = useLoaderData();
  const actionData = useActionData();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">NetSuite → Shopify Sync</h1>
      <p>{loaderData.message}</p>

      <h2 className="text-lg font-semibold mt-4">Fetched Metafields</h2>
      <p className="text-sm text-gray-600">
        Product: <strong>{loaderData.productTitle}</strong>
      </p>

      {loaderData.metafields.length > 0 ? (
        <table className="min-w-full text-sm border mt-2">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Namespace</th>
              <th className="border p-2">Key</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {loaderData.metafields.map((mf) => (
              <tr key={mf.id}>
                <td className="border p-2">{mf.namespace}</td>
                <td className="border p-2">{mf.key}</td>
                <td className="border p-2">{mf.type}</td>
                <td className="border p-2">{mf.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-gray-500">कोई Metafields नहीं मिले।</p>
      )}

      <Form method="post">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
        >
          Data Sync
        </button>
      </Form>

      {actionData && (
        <div className="mt-4 p-3 border rounded bg-gray-50 max-w-2xl overflow-auto">
          <pre className="text-xs text-gray-700">
            {JSON.stringify(actionData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
