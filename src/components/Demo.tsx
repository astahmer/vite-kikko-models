import { OfflineDemo } from "@/offline/OfflineDemo";

export const Demo = () => {
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", margin: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <OfflineDemo />
                </div>
            </div>
        </div>
    );
};
