import Link from "next/link";

const navLinkClass =
  "rounded-full px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground";

export function SiteNav() {
  return (
    <>
      <Link href="/objects" className={navLinkClass}>
        Objects
      </Link>
      <Link href="/about" className={`${navLinkClass} hidden sm:inline`}>
        About
      </Link>
      <Link href="/faq" className={`${navLinkClass} hidden sm:inline`}>
        FAQ
      </Link>
      <Link href="/stats" className={navLinkClass}>
        Stats
      </Link>
    </>
  );
}
