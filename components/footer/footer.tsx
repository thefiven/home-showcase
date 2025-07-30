import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer footer-horizontal footer-center bg-primary text-primary-content p-10">
      <aside>
        <Image
          src={"/logo.png"}
          alt="Logo"
          width={48}
          height={48}
          priority={true}
        />
        <p className="font-bold">Home Showcase</p>
        <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
      </aside>
      <nav>
        <div className="grid grid-flow-col gap-4">
          <Link href="https://www.facebook.com/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
            </svg>
          </Link>
        </div>
      </nav>
    </footer>
  );
}
