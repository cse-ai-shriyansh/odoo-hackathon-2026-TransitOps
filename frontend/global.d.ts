declare namespace JSX {
  type Element = import("react").ReactElement<any, any>;

  interface IntrinsicElements {
    [elementName: string]: any;
  }
}
