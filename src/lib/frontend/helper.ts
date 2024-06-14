type SetTargetNodePosition = (position: { x: number; y: number }) => void;

export const captureCursorPosition = (
  setTargetNodePosition: SetTargetNodePosition
) => {
  const handleMouseMove = (event: { clientX: any; clientY: any }) => {
    setTargetNodePosition({ x: event.clientX, y: event.clientY });
    // Remove listener immediately after capturing position
    window.removeEventListener("mousemove", handleMouseMove);
  };
  window.addEventListener("mousemove", handleMouseMove);
};

export const convertToLocalTime = (gmtTimestamp: string): string => {
  const gmtDate = new Date(gmtTimestamp);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };
  const localTime = gmtDate.toLocaleString(undefined, options);
  return localTime;
};
