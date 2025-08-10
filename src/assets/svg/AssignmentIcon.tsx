import type { SVGProps } from "react";
const SVGComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={20}
    height={21}
    viewBox="0 0 20 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M2.5 18.578h3.333a.83.83 0 0 0 .592-.242l10-10a.833.833 0 0 0 0-1.183L13.092 3.82a.833.833 0 0 0-1.184 0l-10 10a.83.83 0 0 0-.241.591v3.334a.833.833 0 0 0 .833.833m.833-3.825L12.5 5.586l2.158 2.159-9.166 9.166H3.333zm11.425-12.6a.837.837 0 1 0-1.183 1.183l3.333 3.333a.834.834 0 0 0 1.366-.27.83.83 0 0 0-.182-.913z"
      fill="#464255"
    />
  </svg>
);
export default SVGComponent;
