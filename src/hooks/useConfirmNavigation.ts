import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export function useConfirmNavigation(shouldBlockNavigation: boolean) {
  const [showModal, setShowModal] = useState(false);
  const [nextRoute, setNextRoute] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (shouldBlockNavigation) {
        setShowModal(true);
        setNextRoute(url);
        router.events.emit("routeChangeError");
        throw "Navigation blocked";
      }
    };

    window.onbeforeunload = (e: BeforeUnloadEvent) => {
      if (shouldBlockNavigation) {
        e.preventDefault();
      }
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      window.onbeforeunload = null;
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [shouldBlockNavigation]);

  const confirmLeave = () => {
    setShowModal(false);
    window.onbeforeunload = null;
    if (nextRoute) {
      window.location.href = nextRoute;
    }
  };

  const cancelLeave = () => {
    setShowModal(false);
    setNextRoute(null);
  };

  return { showModal, confirmLeave, cancelLeave };
}
