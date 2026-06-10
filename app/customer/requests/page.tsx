/** Legacy route — now /requests (unified portal). */
import { redirect } from "next/navigation";

export default function LegacyCustomerRequestsPage() {
  redirect("/requests");
}
