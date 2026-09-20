/** Legacy route — now /settings (unified portal). */
import { redirect } from "next/navigation";

export default function LegacyCustomerSettingsPage() {
  redirect("/settings");
}
