import { ActiveLink } from "@components/ui/common";
import React from "react";

const BreadcrumbItem = ({ item, index }) => {
  return (
    <li
      className={`${
        index == 0 ? "pr-4" : "px-4"
      } font-medium  text-gray-500 hover:text-gray900`}
    >
      <ActiveLink href={item.href} activeLinkClass="text-yellow-500">
        <a>{item.value}</a>
      </ActiveLink>
    </li>
  );
};

export default function Breadcrumbs({ items, isAdmin }) {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex leading-none text-indigo-600 divide-x divide-indigo-400">
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            {!item.requireAdmin && <BreadcrumbItem item={item} index={index} />}
            {item.requireAdmin && isAdmin && (
              <BreadcrumbItem item={item} index={index} />
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
