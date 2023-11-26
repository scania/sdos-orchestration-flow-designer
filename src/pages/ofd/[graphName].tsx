import dynamic from "next/dynamic";

const Ofd = dynamic(() => import("./Ofd"), { ssr: false });

export default Ofd;
