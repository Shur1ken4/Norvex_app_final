import ScreenHost from "@/components/ScreenHost";
import { B2B } from "@/components/screens";

// Public partner / API marketing page — no login required so prospective
// banks and neobanks can view the pitch, white-label preview and API docs.
export default function Page() {
  return <ScreenHost Screen={B2B} />;
}
