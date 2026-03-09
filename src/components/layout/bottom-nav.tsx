"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/home" },
  { label: "Explore", href: "/explore" },
  { label: "+", href: "/scan", isAction: true },
  { label: "Cabinet", href: "/cabinet" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 bg-vela-white border-t border-parchment py-3 pb-2 flex justify-around items-center">
      {navItems.map((item) =>
        item.isAction ? (
          <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center">
              <span className="text-cream text-lg font-light leading-none">+</span>
            </div>
          </Link>
        ) : (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
            <div
              className={`w-5 h-5 rounded ${
                pathname.startsWith(item.href)
                  ? "bg-ink"
                  : "border-[1.5px] border-sand"
              }`}
            />
            <span
              className={`font-sans text-[9px] ${
                pathname.startsWith(item.href)
                  ? "text-ink font-medium"
                  : "text-stone font-light"
              }`}
            >
              {item.label}
            </span>
          </Link>
        )
      )}
    </nav>
  );
}
