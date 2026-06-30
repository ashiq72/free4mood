import { CreatePostBox } from "@/features/feed/components/CreatePostBox";
import { Feed } from "@/features/feed/components/Feed";
import { LeftSidebar } from "@/features/feed/components/LeftSidebar";
import { RightSidebar } from "@/features/feed/components/RightSidebar";
import { Stories } from "@/features/feed/components/Stories";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--mood-canvas)]">
      <div className="mx-auto grid max-w-[1420px] grid-cols-1 gap-6 px-3 pb-10 pt-6 sm:px-6 xl:grid-cols-[minmax(220px,1fr)_minmax(0,720px)_minmax(220px,1fr)]">
        <div className="sticky top-24 hidden h-[calc(100vh-7rem)] min-w-0 overflow-y-auto xl:block">
          <LeftSidebar />
        </div>

        <main className="mx-auto w-full max-w-[720px] min-w-0 justify-self-center">
          <header className="mb-5 flex items-end justify-between border-b border-[var(--mood-line)] pb-4">
            <div>
              <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase text-[var(--mood-coral)]">
                <Sparkles className="h-3.5 w-3.5" />
                Live from your circle
              </div>
              <h1 className="text-2xl font-bold text-[var(--mood-ink)] sm:text-3xl">
                Your pulse
              </h1>
            </div>
            <p className="hidden max-w-48 text-right text-xs leading-5 text-[var(--mood-muted)] sm:block">
              Fresh moments and honest thoughts from people you know.
            </p>
          </header>

          <Stories />
          <div className="mb-4">
            <CreatePostBox />
          </div>
          <Feed />
        </main>

        <div className="sticky top-24 hidden h-[calc(100vh-7rem)] min-w-0 overflow-y-auto xl:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
