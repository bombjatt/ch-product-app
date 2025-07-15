import { json } from "@remix-run/node";
import { fetchNetSuiteCustomers } from "~/utils/netsuite.server";

export const loader = async () => {
  try {
    const data = await fetchNetSuiteCustomers();
    return json({ success: true, data });
  } catch (error) {
    console.error(error);
    return json({ success: false, error: error.message });
  }
};
