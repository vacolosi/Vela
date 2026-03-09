import Link from "next/link";

export default function HeroPage() {
  return (
    <div className="min-h-screen bg-vela-white flex flex-col">
      <div className="flex-1 flex flex-col justify-end px-8 pb-12">
        <h1 className="font-serif text-4xl font-light italic text-ink leading-tight mb-4">
          Make beauty
          <br />
          make sense.
        </h1>
        <p className="font-sans text-sm text-clay font-light leading-relaxed max-w-[280px]">
          The intelligence layer between your collection and your next purchase.
        </p>
      </div>
      <div className="px-8 pb-12">
        <Link
          href="/signup"
          className="block w-full py-4 bg-ink rounded-[10px] text-center"
        >
          <span className="font-sans text-[15px] text-cream font-normal">
            Start My Cabinet
          </span>
        </Link>
        <div className="text-center mt-3">
          <Link
            href="/login"
            className="font-sans text-[13px] text-stone font-light"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
