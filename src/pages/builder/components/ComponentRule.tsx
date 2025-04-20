"use client";

import { Component } from "../builder-types"


export const ComponentRule = ({
  title,
  startingText,
  onClick,
  isRecommended,
}: Component & { onClick: () => void; isRecommended: boolean }) => {
  return (
    <button
      className="flex-1 bg-white rounded shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border border-gray-500 flex flex-col items-center justify-center p-6 gap-2 relative"
      onClick={onClick}
    >
      {isRecommended && (
        <div className="absolute -top-3 w-full">
          <span className="bg-blue text-white px-3 py-1 text-sm rounded-sm">
            Anbefalt
          </span>
        </div>
      )}
      <div className="text-black text-xs">Start with</div>
      <div className="text-black text-[40px] font-bold">{title}</div>
      <div className="w-[99px] h-[0px] border border-black mb-4"></div>
      <div className="text-center text-sm">{startingText}</div>
    </button>
  );
};
