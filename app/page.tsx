import { HomePage } from "@/components/home/home-page";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    tag?: string;
    category?: string;
    page?: string;
    auth?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  return <HomePage searchParams={searchParams} />;
}
