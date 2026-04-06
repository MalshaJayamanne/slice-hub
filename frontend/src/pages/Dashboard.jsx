export default function Dashboard() {
  const storedUser = localStorage.getItem("authUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col justify-center gap-4 px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#FF3B30]">
        Protected Route
      </p>
      <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A]">
        Welcome back{user?.name ? `, ${user.name}` : ""}.
      </h1>
      <p className="max-w-2xl text-lg text-gray-600">
        You are signed in{user?.role ? ` as a ${user.role}` : ""}. This page is only available when a valid token exists in local storage.
      </p>
    </section>
  );
}
