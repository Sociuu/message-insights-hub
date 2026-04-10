import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { mockMessage } from "@/data/mockMessageData";
import { BrevoLayout } from "@/components/message-details/BrevoLayout";
import { SideNavLayout } from "@/components/message-details/SideNavLayout";
import { LayoutDashboard, PanelLeft } from "lucide-react";

export default function MessageDetails() {
  const navigate = useNavigate();
  const msg = mockMessage;
  const [layout, setLayout] = useState<"brevo" | "sidenav">("brevo");

  return (
    <div className="relative">
      {/* Layout toggle — floating pill */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-1 rounded-full border bg-background/95 backdrop-blur shadow-lg p-1">
        <button
          onClick={() => setLayout("brevo")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            layout === "brevo" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Progressive
        </button>
        <button
          onClick={() => setLayout("sidenav")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            layout === "sidenav" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PanelLeft className="h-3.5 w-3.5" />
          Side Nav
        </button>
      </div>

      {layout === "brevo" ? (
        <BrevoLayout msg={msg} onBack={() => navigate(-1)} />
      ) : (
        <SideNavLayout msg={msg} onBack={() => navigate(-1)} />
      )}
    </div>
  );
}
