"use client";

import Link from "next/link";

type NavLinkType = { name: string; href: string };

export default function NavLinks({ navLinks }: { navLinks: NavLinkType[] }) {
  return (
    <>
      {navLinks.map((navLinks, index) => (
        <li key={index}>
          <Link href={navLinks.href} key={navLinks.name}>
            {navLinks.name}
          </Link>
        </li>
      ))}
    </>
  );
}
