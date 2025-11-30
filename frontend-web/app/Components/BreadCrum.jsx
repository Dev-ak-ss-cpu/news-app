"use client";

import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { Home } from "lucide-react";

/**
 * Generic breadcrumb component for category & article pages
 *
 * Props:
 * - categoryPath: array like [{ name, slug }, ...]
 * - currentLabel: string (current category or article title)
 * - homeLabel: string (default: "होम")
 */
export default function CategoryBreadcrumbs({
    categoryPath = [],
    currentLabel,
    homeLabel = "होम",
}) {
    // Normalize categoryPath to safe array
    const safePath = Array.isArray(categoryPath) ? categoryPath : [];

    // Build breadcrumb items
    const items = [];

    // Home
    items.push({
        href: "/",
        label: homeLabel,
        isCurrent: !safePath.length && !currentLabel,
        isHome: true,
    });

    // Intermediate categories
    if (safePath.length > 0) {
        safePath.forEach((cat, index) => {
            const slug = typeof cat?.slug === "string" ? cat.slug : "";
            if (!slug) return;

            const label =
                typeof cat?.name === "string" ? cat.name : `Category ${index + 1}`;

            const href =
                "/" +
                safePath
                    .slice(0, index + 1)
                    .map((c) => c?.slug || "")
                    .filter(Boolean)
                    .join("/");

            items.push({
                href,
                label,
                isCurrent: !currentLabel && index === safePath.length - 1,
                isHome: false,
            });
        });
    }

    // Current page (category or article)
    if (currentLabel) {
        items.push({
            href: "#",
            label: currentLabel,
            isCurrent: true,
            isHome: false,
        });
    }

    return (
        <Breadcrumbs
            classNames={{
                list: "gap-2",
                item:
                    "text-sm data-[current=true]:text-blue-600 data-[current=true]:font-semibold",
            }}
        >
            {items.map((item, index) => (
                <BreadcrumbItem
                    key={`breadcrumb-${index}`}
                    href={item.isCurrent ? undefined : item.href}
                    isCurrent={item.isCurrent}
                    isDisabled={item.isCurrent}
                >
                    {item.isHome ? (
                        <div className="flex items-center gap-1">
                            <Home size={14} />
                            <span>{item.label}</span>
                        </div>
                    ) : (
                        item.label
                    )}
                </BreadcrumbItem>
            ))}
        </Breadcrumbs>
    );
}
