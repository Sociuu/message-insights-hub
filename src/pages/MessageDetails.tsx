import { useNavigate } from "react-router-dom";
import { mockMessage } from "@/data/mockMessageData";
import { SideNavLayout } from "@/components/message-details/SideNavLayout";

export default function MessageDetails() {
  const navigate = useNavigate();
  return <SideNavLayout msg={mockMessage} onBack={() => navigate(-1)} />;
}
