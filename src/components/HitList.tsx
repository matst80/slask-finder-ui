import { ReactNode, Fragment } from "react";
import { Item } from "../lib/types";
import { useQuery } from "../lib/hooks/useQuery";

export const HitList = <T extends { item: Item }>({
  children,
  className,
  ...props
}: {
  children: (props: T) => ReactNode;
  className?: string;
} & Omit<T, "item">) => {
  const { hits } = useQuery();
  return (
    <div className={className}>
      {hits.map((item) => {
        return (
          <Fragment key={item.id}>
            {children({ ...props, item } as unknown as T)}
          </Fragment>
        );
      })}
    </div>
  );
};
