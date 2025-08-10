import type { SVGProps } from "react";
const SVGComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={18}
    viewBox="0 0 16 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M.5 6.666v10a.833.833 0 0 0 .833.834H5.5a.833.833 0 0 0 .833-.834v-5.833h3.334v5.833a.833.833 0 0 0 .833.834h4.167a.833.833 0 0 0 .833-.834v-10A.83.83 0 0 0 15.167 6L8.5 1a.83.83 0 0 0-1 0L.833 6a.83.83 0 0 0-.333.666m1.667.417L8 2.708l5.833 4.375v8.75h-2.5V10a.834.834 0 0 0-.833-.834h-5a.833.833 0 0 0-.833.834v5.833h-2.5z"
      fill={props.color || "#000000"}
    />
  </svg>
);
export default SVGComponent;
