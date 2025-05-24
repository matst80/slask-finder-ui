"use client";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useId,
  useState,
} from "react";
import { RelationGroup } from "../types";

type GroupDesignerContext = {
  group: RelationGroup;
  setGroup: React.Dispatch<React.SetStateAction<RelationGroup>>;
};

const GroupDesignerContext = createContext<GroupDesignerContext | null>(null);

export const GroupDesignerProvider = ({
  children,
  initialGroup,
}: PropsWithChildren<{ initialGroup?: RelationGroup }>) => {
  const id = useId();
  const [group, setGroup] = useState<RelationGroup>(
    initialGroup || {
      name: "New group",
      key: id,
      exclude_ids: [],
      include_ids: [],
      groupId: 0,
      relations: [],
      requiredForItem: [],
      additionalQueries: [],
    }
  );
  return (
    <GroupDesignerContext.Provider value={{ group, setGroup }}>
      {children}
    </GroupDesignerContext.Provider>
  );
};

export const useGroupDesigner = () => {
  const context = useContext(GroupDesignerContext);
  if (context === null) {
    throw new Error(
      "useGroupDesigner must be used within a GroupDesignerProvider"
    );
  }
  return context;
};
