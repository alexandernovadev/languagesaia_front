/**
 * PageTransition — smooth screen change: the new screen slides in from the
 * right and fades (from the left when going `back`). No bounce: navigation is
 * calm, bounce is reserved for things you touch and celebrations.
 *
 * Give it a `screen` key; when the key changes the content re-mounts and animates.
 *
 * @example
 *   <PageTransition screen={route} direction={goingBack ? "back" : "forward"}>
 *     {renderRoute(route)}
 *   </PageTransition>
 */
import type { ReactNode } from "react";
import styles from "./PageTransition.module.css";

export function PageTransition({ screen, direction = "forward", children }: { screen: string; direction?: "forward" | "back"; children: ReactNode }) {
  return (
    <div key={screen} className={styles.root} data-direction={direction}>
      {children}
    </div>
  );
}
