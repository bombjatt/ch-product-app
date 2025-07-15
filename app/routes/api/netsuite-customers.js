// app/routes/api/netsuite-customers.tsx
import { json } from "@remix-run/node";
import { fetchNetSuiteCustomers } from "../../netsuite.server";

export const loader = async () => {
  try {
    const customers = await fetchNetSuiteCustomers();
    return json({ success: true, data: customers });
  } catch (error) {
    console.error("❌ API Route Error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};
