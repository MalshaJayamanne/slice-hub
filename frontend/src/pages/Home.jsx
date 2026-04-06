import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-center gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#FF3B30]">
          Slice Hub
        </p>
        <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A] sm:text-5xl lg:text-6xl">
          Order your favorite meals with a cleaner login flow and faster dashboard access.
        </h1>
        <p className="text-lg leading-8 text-gray-600">
          Browse restaurants, manage your account, and move into the protected dashboard once you sign in.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          to="/login"
          className="rounded-2xl bg-[#FF3B30] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#E0352B]"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="rounded-2xl border border-[#1A1A1A] px-6 py-3 text-sm font-bold text-[#1A1A1A] transition hover:bg-[#1A1A1A] hover:text-white"
        >
          Create Account
        </Link>
      </div>
    </section>
  );
}
