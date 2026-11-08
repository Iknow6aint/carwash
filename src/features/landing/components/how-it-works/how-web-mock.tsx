import { Blueprint } from "@/components/ui/blueprint";

import { HOW_URLS } from "../../utils/demo-data";

import { WebDashboardPanel } from "./web-dashboard-panel";
import { WebPosterPanel } from "./web-poster-panel";
import { WebSalePanel } from "./web-sale-panel";
import { WebUploadPanel } from "./web-upload-panel";

const PANELS = [WebUploadPanel, WebPosterPanel, WebSalePanel, WebDashboardPanel];

/** The browser window for the active step. */
export function HowWebMock({ active, shown }: { active: number; shown: boolean }) {
  const Panel = PANELS[active] ?? WebUploadPanel;
  return (
    <Blueprint className="flex min-h-[440px] min-w-0 flex-[1_1_340px] flex-col bg-bg">
      <div className="flex items-center gap-1.5 border-b border-divider px-3 py-[9px]">
        <span className="size-2 flex-none bg-neutral-400" />
        <span className="size-2 flex-none bg-neutral-400" />
        <span className="size-2 flex-none bg-neutral-400" />
        <span className="ml-2.5 min-w-0 flex-1 truncate bg-neutral-200 px-2.5 py-1 text-[11px] text-neutral-700">
          {HOW_URLS[active]}
        </span>
        <span className="text-[10px] tracking-[0.1em] text-accent uppercase">Web</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Panel shown={shown} />
      </div>
    </Blueprint>
  );
}
