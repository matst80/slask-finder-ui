import { useLoaderData } from "react-router-dom";
import { Rule } from "./builder-types";
import { ButtonLink } from "../../components/ui/button";

export const BuilderComponentSelector = () => {
  const component = useLoaderData() as Rule;
  if (!component || component.type !== "selection") {
    return <div>not correct!</div>;
  }
  return (
    <div>
      {component.options.map((option) => {
        return (
          <ButtonLink size="lg" to={`/builder/component/${option.id}`}>
            {option.title}
          </ButtonLink>
        );
      })}
    </div>
  );
};
