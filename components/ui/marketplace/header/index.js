import { Breadcrumbs } from "@components/ui/common";
import { EthRates, WalletBar } from "@components/ui/web3";

const LINKS = [
  {
    href: "/marketplace",
    value: "Buy",
  },
  {
    href: "/marketplace/courses/owned",
    value: "My Courses",
  },
  {
    href: "/marketplace/courses/manage",
    value: "Manage Courses",
  },
];

export default function Header() {
  return (
    <>
      <div className="pt-4">
        <WalletBar />
        <EthRates />
        <div className="flex flex-row-reverse p-4 ">
          <Breadcrumbs items={LINKS} />
        </div>
      </div>
    </>
  );
}