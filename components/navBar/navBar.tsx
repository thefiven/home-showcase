import NavLinks from "@/components/navBar/navLinks";
import Link from "next/link";
import Image from "next/image";

type NavLinkType = { name: string; href: string };

export default function NavBar({ navLinks }: { navLinks: NavLinkType[] }) {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <NavLinks navLinks={navLinks} />
          </ul>
        </div>
        <Link href={"/"}>
          <Image
            src={"/logo.png"}
            alt="Logo"
            width={48}
            height={48}
            priority={true}
          />
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <NavLinks navLinks={navLinks} />
        </ul>
      </div>
      <div className="navbar-end">
        <Link href={"/visit"} className="btn">
          Disponibilités
        </Link>
      </div>
    </div>
  );
}
