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
      d="M17.5 16.078H4.167V2.744a.833.833 0 1 0-1.667 0v14.167a.833.833 0 0 0 .833.833H17.5a.833.833 0 0 0 0-1.666"
      fill="#464255"
    />
    <path
      d="M5.833 9.411v4.167a.833.833 0 0 0 1.667 0V9.411a.833.833 0 1 0-1.667 0m3.334-4.167v8.334a.833.833 0 0 0 1.666 0V5.244a.833.833 0 1 0-1.666 0M12.5 6.911v6.667a.833.833 0 0 0 1.667 0V6.911a.833.833 0 1 0-1.667 0m3.333-4.167v10.834a.833.833 0 0 0 1.667 0V2.744a.834.834 0 0 0-1.667 0"
      fill="#464255"
    />
  </svg>
);
export default SVGComponent;
