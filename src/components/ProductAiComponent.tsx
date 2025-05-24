"use client";

import { useState } from "react";
import { ItemDetail } from "../lib/types";
import { BotMessageSquare } from "lucide-react";
import { AiChatForCurrentProduct } from "./itemdetails/AiChatForCurrentProduct";
import { Button } from "./ui/button";
import { Sidebar } from "./ui/sidebar";

export const ProductAiComponent = ({ details }: { details: ItemDetail }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="shrink-1"
        title="Ask AI assistant"
        onClick={() => setOpen((p) => !p)}
      >
        <BotMessageSquare className="size-5" />
      </Button>
      <Sidebar side="right" open={open} setOpen={setOpen}>
        <div className="bg-white flex flex-col overflow-y-auto py-6 px-4 h-full w-full max-w-full md:max-w-lg">
          {open && <AiChatForCurrentProduct {...details} />}
        </div>
      </Sidebar>
    </>
  );
};
