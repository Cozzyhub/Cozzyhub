import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      className="flex items-center gap-2 text-sm mb-6"
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        className="text-gray-500 hover:text-pink-600 transition flex items-center gap-1"
      >
        <Home size={16} />
        <span>Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={16} className="text-gray-400" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-pink-600 transition"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
