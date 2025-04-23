import { useLoaderData } from "react-router-dom";
import { Rule } from "./builder-types";
import { ButtonLink } from "../../components/ui/button";

export const BuilderComponentSelector = () => {
  const component = useLoaderData() as Rule;
  if (!component || component.type !== "selection") {
    return <div>not correct!</div>;
  }
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
      {component.options.map((option) => {
        return (
          <ButtonLink
            size="lg"
            to={`/builder/component/${option.id}?parentId=${component.id}`}
            key={option.id}
          >
            {option.title}
          </ButtonLink>
        );
      })}
    </div>
  );
};
