/**item da linha do tempo (year, title, image, children). Alterna lado com prop `right`. */

import { cn } from "../utils/cn.js";

export default function TimelineItem({ year, title, image, right = false, children }) {
  return (
    <div className={cn("timeline__item", right && "timeline__item--right")}>
      <div className="timeline__media">
        <img src={image} alt={`${title} (${year})`} />
      </div>
      <div className="timeline__content">
        <div className="timeline__year">{year}</div>
        <h4>{title}</h4>
        <p>{children}</p>
      </div>
    </div>
  );
}
