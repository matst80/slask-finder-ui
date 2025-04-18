import { useEffect, useRef } from "react";
import { useLoaderData } from "react-router-dom";
import { getConfirmation } from "../lib/datalayer/api";

export const Confirmation = () => {
  const ref = useRef<HTMLDivElement>(null);
  const data = (useLoaderData() as { id: string }) || undefined;
  useEffect(() => {
    if (data?.id != null && ref.current) {
      getConfirmation(data.id).then((data) => {
        if (!ref.current) return;
        const { html_snippet } = data;
        ref.current!.innerHTML = html_snippet;
        const scriptsTags = ref.current!.getElementsByTagName("script");
        // This is necessary otherwise the scripts tags are not going to be evaluated
        for (let i = 0; i < scriptsTags.length; i++) {
          const parentNode = scriptsTags[i].parentNode;
          const newScriptTag = document.createElement("script");
          newScriptTag.type = "text/javascript";
          newScriptTag.text = scriptsTags[i].text;
          parentNode?.removeChild(scriptsTags[i]);
          parentNode?.appendChild(newScriptTag);
        }
      });
    }
  }, [data]);
  return <div ref={ref}>Your order is beeing processed...</div>;
};
