import Image from "next/image";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";
import crypto from "node:crypto";

export const metadata = { title: "Hyrje" };

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  const a = crypto.createHash("sha256").update(password).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  if (!expected || !crypto.timingSafeEqual(a, b)) {
    await new Promise((r) => setTimeout(r, 800));
    redirect("/admin/hyrje?gabim=1");
  }
  await createSession();
  redirect("/admin");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ gabim?: string }> }) {
  const { gabim } = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center bg-linen px-4">
      <form action={login} className="w-full max-w-sm border border-line bg-white p-8">
        <Image src="/brand/logo-black.png" alt="Soft Home" width={180} height={19} className="mx-auto h-5 w-auto" />
        <p className="mt-3 text-center text-xs uppercase tracking-[0.16em] text-muted">Paneli i menaxhimit</p>
        <label className="label mt-8" htmlFor="password">Fjalëkalimi</label>
        <input id="password" name="password" type="password" required autoFocus className="field" />
        {gabim && <p className="mt-2 text-sm text-danger">Fjalëkalimi është i gabuar.</p>}
        <button className="btn btn-primary mt-6 w-full">Hyr</button>
      </form>
    </div>
  );
}
