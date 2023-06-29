import { getAuthSession } from "@/lib/auth";
import Link from "next/link";
import SearchBar from "./SearchBar";
import UserAccountNav from "./UserAccountNav";
import { buttonVariants } from "./ui/Button";
import logo from "@/assets/icon.svg";
import Image from "next/image";

const Navbar = async () => {
  const session = await getAuthSession();

  return (
    <div className="fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-[10] py-2">
      <div className="container max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
        <Link href="/" className="flex gap-2 items-center">
          <Image
            src={logo}
            alt="logo"
            width={32}
            height={32}
            className="max-w-[32px] h-8"
          />
          <p className="hidden text-zinc-700 text-sm font-medium md:block">
            Postit
          </p>
        </Link>

        <SearchBar />

        {session?.user ? (
          <UserAccountNav user={session.user} />
        ) : (
          <Link
            href="/sign-in"
            className={buttonVariants({
              className: "whitespace-nowrap",
            })}
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
