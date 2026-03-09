import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-vela-white flex flex-col max-w-md mx-auto md:shadow-lg">
      <div className="flex-1 pb-20">{children}</div>
      <BottomNav />
    </div>
  );
}
