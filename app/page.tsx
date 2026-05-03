import { HomePage } from "@/components/home/home-page";

type PageProps = {
  searchParams?: {
    q?: string;
    tag?: string;
    category?: string;
    page?: string;
  };
};

export default function Page({ searchParams }: PageProps) {
  return <HomePage searchParams={searchParams} />;
}
