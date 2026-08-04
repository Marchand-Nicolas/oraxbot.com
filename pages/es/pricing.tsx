import type { GetServerSideProps } from "next";
import Pricing from "../../components/pages/Pricing";
import {
  getPricingRegion,
  type PricingRegion,
} from "../../utils/pricing";

interface PricingPageProps {
  pricingRegion: PricingRegion;
}

export const getServerSideProps: GetServerSideProps<PricingPageProps> = async ({
  req,
}) => ({
  props: {
    pricingRegion: getPricingRegion(req.headers["x-vercel-ip-country"]),
  },
});

export default function PricingEs({ pricingRegion }: PricingPageProps) {
  return <Pricing lang="es" pricingRegion={pricingRegion} />;
}
