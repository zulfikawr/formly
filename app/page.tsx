"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileCheck, Plus } from "lucide-react";
import UserDropdown from "@/components/user-dropdown";

type UserType = {
  id: string;
  name: string | null;
  email: string;
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <FileCheck className="h-6 w-6" />
              <span className="text-xl font-bold">Formly</span>
            </Link>
          </div>
          {user ? (
            <nav className="flex items-center gap-4">
              <Link href="/dashboard/forms/new" className="hidden md:block">
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> New Form
                </Button>
              </Link>
              <UserDropdown />
            </nav>
          ) : (
            <nav className="flex items-center gap-4">
              <Link href="/signin">
                <Button variant="outline">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button>Get started</Button>
              </Link>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1">
        <section className="flex h-[calc(100vh-10rem)] items-center justify-center">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Create Forms with Ease
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Build forms, collect responses, and analyze data with Formly.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button size="lg">Dashboard</Button>
                    </Link>
                    <Link href="/dashboard/forms/new">
                      <Button size="lg" variant="outline" className="gap-1">
                        <Plus className="h-4 w-4" /> New Form
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg">Get Started</Button>
                    </Link>
                    <Link href="/signin">
                      <Button size="lg" variant="outline">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-4 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
            © {new Date().getFullYear()} Formly{" · "}
            <Link
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-xs md:text-sm"
            >
              CC BY-NC-SA 4.0
            </Link>
            {" · "}
            <Link
              href="https://github.com/zulfikawr/formly"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-xs md:text-sm"
            >
              Open Source Software (OSS).
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
