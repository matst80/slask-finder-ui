import useSWRMutation, { SWRMutationConfiguration } from "swr/mutation";
import { ItemValues, Price } from "./types";

export function remove<T>(key: string | number) {
  return (prev: { [key: string]: T }) => {
    const { ...rest } = prev;
    delete rest[key];
    return rest;
  };
}
export const makeImageUrl = (
  pathOrUrl: string,
  size = "--pdp_main-640.jpg"
) => {
  if (pathOrUrl.startsWith("http")) {
    return pathOrUrl;
  }
  return "https://www.elgiganten.se" + pathOrUrl?.replace(".jpg", size);
};

export const useFetchMutation = <T, U>(
  key: string,
  fn: (payload: U) => Promise<T>,
  config?: SWRMutationConfiguration<T, Error, string, U>
) => {
  return useSWRMutation(key, (_, { arg }) => fn(arg), {
    ...config,
    populateCache: true,
  });
};

export const getPrice = (values: ItemValues): Price => {
  const current = Number(values["4"]);
  const original = values["5"] != null ? Number(values["5"]) : null;
  const discount = values["8"] != null ? Number(values["8"]) : null;

  if (original != null && original > current) {
    return {
      isDiscounted: true,
      current,
      original,
      discount: discount ?? original - current,
    };
  }
  return {
    isDiscounted: false,
    current: Number(current ?? 0),
  };
};

const colorHexMap: Record<string, string> = {
  Antracit: "#293133",
  Azure: "#007FFF",
  Beige: "#F5F5DC",
  "Beige/Silver": "#C0C0C0",
  Black: "#000000",
  "Black /Green": "#004225",
  "Black, Blue": "#0000FF",
  "Black, Red": "#FF0000",
  "Black/Gold": "#FFD700",
  "Black/Green": "#008000",
  "Black/Pink": "#FFC0CB",
  "Black/Red": "#FF0000",
  "Black/Silver": "#C0C0C0",
  "Black/White": "#FFFFFF",
  Blue: "#0000FF",
  Blå: "#0000FF",
  Brons: "#CD7F32",
  Brown: "#A52A2A",
  "Brown/Gold": "#FFD700",
  Brun: "#A52A2A",
  "Brushed stainless steel": "#C0C0C0",
  "Clear & Black": "#000000",
  Cyan: "#00FFFF",
  "Dark Grey": "#A9A9A9",
  Flerfärgad: "#FFFFFF",
  Genomskinlig: "#FFFFFF",
  Gold: "#FFD700",
  Gray: "#808080",
  Green: "#008000",
  Greige: "#BEBEBE",
  Grey: "#808080",
  Gräddvit: "#FFFDD0",
  Grå: "#808080",
  "Grå/Svart": "#000000",
  Grön: "#008000",
  Gul: "#FFFF00",
  Guld: "#FFD700",
  Jade: "#00A86B",
  Klart: "#FFFFFF",
  Koppar: "#B87333",
  Krom: "#C0C0C0",
  Lila: "#800080",
  Magenta: "#FF00FF",
  "Multi-coloured": "#FFFFFF",
  Multicolor: "#FFFFFF",
  Multicolour: "#FFFFFF",
  Mässing: "#B5A642",
  Orange: "#FFA500",
  Pink: "#FFC0CB",
  Purple: "#800080",
  Red: "#FF0000",
  Rosa: "#FFC0CB",
  "Rose Gold": "#B76E79",
  "Rostfritt stål": "#C0C0C0",
  Röd: "#FF0000",
  Silver: "#C0C0C0",
  "Silver/Purple": "#800080",
  Steel: "#C0C0C0",
  Stål: "#C0C0C0",
  Svart: "#000000",
  "Svart rostfritt stål": "#000000",
  Teal: "#008080",
  Turkos: "#40E0D0",
  Ultramarine: "#3F00FF",
  Violet: "#8F00FF",
  Vit: "#FFFFFF",
  White: "#FFFFFF",
  Yellow: "#FFFF00",
  black: "#000000",
  silver: "#C0C0C0",
};

export const colourNameToHex = (color: string) => {
  return colorHexMap[color];
};

const toDisplayValue = (type: string) => (value: number) => {
  if (type === "currency") {
    return value / 100;
  }
  return value;
};
const fromDisplayValue = (type: string) => (value: number) => {
  if (type === "currency") {
    return Math.round(value * 100);
  }
  return value;
};

export const converters = (type: string) => {
  return {
    toDisplayValue: toDisplayValue(type),
    fromDisplayValue: fromDisplayValue(type),
  };
};

type PrioProps = {
  prio?: number;
};

export const byPriority = (a: PrioProps, b: PrioProps) =>
  (b.prio ?? 0) - (a.prio ?? 0);
