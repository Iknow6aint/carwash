import { PageSkeleton } from "@/components/feedback/page-skeleton";

/** Shown the moment a sidebar link is clicked, while the next page renders on the server. */
export default function DeskLoading() {
  return <PageSkeleton />;
}
