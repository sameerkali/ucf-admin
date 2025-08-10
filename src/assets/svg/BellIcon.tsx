import type { SVGProps } from "react";
const SVGComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={22}
    height={22}
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.73 20a2 2 0 0 1-3.46 0M21 16H1a3 3 0 0 0 3-3V8a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3"
      stroke="#0647A9"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default SVGComponent;
