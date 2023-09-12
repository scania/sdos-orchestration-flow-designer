import { defineCustomElements, JSX as LocalJSX } from "@scania/tegel/loader";
if (typeof window !== "undefined") {
  defineCustomElements(window);
}
import { DetailedHTMLProps, HTMLAttributes } from "react";

type StencilProps<T> = {
  [P in keyof T]?: Omit<T[P], "ref"> | HTMLAttributes<T>;
};

type ReactProps<T> = {
  [P in keyof T]?: DetailedHTMLProps<HTMLAttributes<T[P]>, T[P]>;
};

type StencilToReact<
  T = LocalJSX.IntrinsicElements,
  U = HTMLElementTagNameMap
> = StencilProps<T> & ReactProps<U>;

// Keep this declaration to extend JSX to understand custom elements
declare global {
  export namespace JSX {
    interface IntrinsicElements extends StencilToReact {}
  }
}
