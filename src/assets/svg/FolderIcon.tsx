import type { SVGProps } from "react";
const SVGComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={20}
    height={18}
    viewBox="0 0 20 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M18.333 15.078a1.667 1.667 0 0 1-1.666 1.667H3.333a1.667 1.667 0 0 1-1.666-1.667V3.411a1.667 1.667 0 0 1 1.666-1.666H7.5l1.667 2.5h7.5a1.667 1.667 0 0 1 1.666 1.666z"
      stroke="#5F5F5F"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default SVGComponent;
