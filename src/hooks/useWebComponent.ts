import { useRef, useEffect, MutableRefObject } from "react";

/**
 * useWebComponent
 * A custom hook to add and remove event listeners on web components.
 *
 * @param eventName - The name of the event (e.g., 'tdsClick').
 * @param handler - The callback function to be executed when the event is triggered.
 * @returns A ref that can be attached to the web component.
 */
function useWebComponent<T extends HTMLElement>(
  eventName: string,
  handler: (event: Event) => void
): MutableRefObject<T | null> {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.addEventListener(eventName, handler);
      return () => {
        element.removeEventListener(eventName, handler);
      };
    }
  }, [eventName, handler]);

  return elementRef;
}

export default useWebComponent;
