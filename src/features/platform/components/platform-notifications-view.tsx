"use client";

import Link from "next/link";

import { ErrorState } from "@/components/feedback/error-state";
import { DateText } from "@/components/ui/date-text";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/ui/tag";

import { usePlatformNotifications } from "../hooks/use-platform";

/** Recent platform activity: registrations to review and businesses that were suspended. */
export function PlatformNotificationsView() {
  const notifications = usePlatformNotifications();

  if (notifications.isPending) {
    return (
      <div
        className="flex max-w-[880px] flex-col gap-2"
        role="status"
        aria-label="Loading notifications"
      >
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  if (notifications.isError) {
    return (
      <ErrorState
        error={notifications.error}
        onRetry={() => void notifications.refetch()}
        title="Notifications didn't load."
      />
    );
  }
  if (notifications.data.length === 0) {
    return (
      <p className="border border-divider px-4 py-6 text-[14px] text-neutral-700">
        Nothing needs attention. New registrations and suspensions appear here.
      </p>
    );
  }

  return (
    <div className="flex max-w-[880px] flex-col">
      {notifications.data.map((notification) => (
        <Link
          className="flex flex-wrap items-start gap-3 border-b border-divider py-4 text-text no-underline hover:bg-neutral-100"
          href={notification.href}
          key={notification.id}
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <Tag tone={notification.type === "registration" ? "outline" : "neutral"}>
                {notification.type === "registration" ? "Registration" : "Suspension"}
              </Tag>
              <span className="font-medium">{notification.title}</span>
            </span>
            <span className="mt-1 block text-[13px] text-neutral-800">{notification.body}</span>
          </span>
          <span className="text-[12px] whitespace-nowrap text-neutral-700">
            <DateText format="short" value={notification.at} />
          </span>
        </Link>
      ))}
    </div>
  );
}
