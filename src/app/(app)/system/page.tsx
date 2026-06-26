import ScreenHost from "@/components/ScreenHost";
import RoleGate from "@/components/RoleGate";
import { SystemDocs } from "@/components/screens";

export default function Page() {
  return (
    <RoleGate allow={["admin"]}>
      <ScreenHost Screen={SystemDocs} />
    </RoleGate>
  );
}
