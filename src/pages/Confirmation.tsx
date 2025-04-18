import { useEffect, useRef } from "react";
import { useLoaderData } from "react-router-dom";
import { ButtonLink } from "../components/ui/button";

export const Confirmation = () => {
  const ref = useRef<HTMLDivElement>(null);
  const data = useLoaderData() as { html_snippet: string } | undefined;
  const resetCart = () => {
    clearCart();
  };
  useEffect(() => {
    if (data != null && ref.current != null) {
      if (!ref.current) return;
      const { html_snippet } = data;
      ref.current.innerHTML = html_snippet;
      const scriptsTags = ref.current.getElementsByTagName("script");
      // This is necessary otherwise the scripts tags are not going to be evaluated
      for (let i = 0; i < scriptsTags.length; i++) {
        const parentNode = scriptsTags[i].parentNode;
        const newScriptTag = document.createElement("script");
        newScriptTag.type = "text/javascript";
        newScriptTag.text = scriptsTags[i].text;
        parentNode?.removeChild(scriptsTags[i]);
        parentNode?.appendChild(newScriptTag);
      }
    }
  }, [data, ref]);
  return (
    <div>
      <div ref={ref} className="my-6">
        Your order is beeing processed...
      </div>
      <ButtonLink onClick={resetCart} to={"/"} size="lg" className="w-full">
        Continue shopping
      </ButtonLink>
    </div>
  );
};
