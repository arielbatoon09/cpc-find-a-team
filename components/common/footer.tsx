import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Developed with ❤️ by <span className="font-semibold text-primary"><Link target="_blank" href="https://www.arielbatoon.com">Ariel Batoon</Link></span>
        </p>
      </div>
    </footer>
  );
}
