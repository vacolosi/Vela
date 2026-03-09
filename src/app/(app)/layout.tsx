import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-vela-white flex flex-col max-w-md mx-auto">
      <div className="flex-1">{children}</div>
      <BottomNav />
    </div>
  );
}
