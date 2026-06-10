/** Legacy route — the customer dashboard now lives at /dashboard (unified portal). */
import { redirect } from "next/navigation";

export default function LegacyCustomerPage() {
  redirect("/dashboard");
}
