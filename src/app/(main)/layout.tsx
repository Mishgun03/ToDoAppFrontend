"use client";

import { Suspense, useState } from "react";
import { Menu, CheckSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "@/widgets/sidebar/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
        <Suspense>
          <SidebarContent />
        </Suspense>
      </aside>

      {/* Mobile top bar + sheet */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b px-4 md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" />}
            >
              <Menu className="size-5" />
              <span className="sr-only">Меню</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
              <SheetTitle className="sr-only">Навигация</SheetTitle>
              <Suspense>
                <SidebarContent onNavigate={() => setSheetOpen(false)} />
              </Suspense>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 text-primary">
            <CheckSquare className="size-5" />
            <span className="font-bold">TodoAPI</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
