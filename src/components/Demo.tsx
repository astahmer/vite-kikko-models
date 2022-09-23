import { useState } from "react";

import { Show } from "./Show";

export const Demo = () => {
    const [isShown, setIsShown] = useState(false);
    const obj = isShown ? { text: "children" } : undefined;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", margin: "auto" }}>
                <div style={{ textAlign: "center", fontSize: "50px" }}>Ready to go</div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <h1>{isShown ? "Shown" : "Hidden"}</h1>
                    <div>
                        <input type="checkbox" onChange={() => setIsShown((current) => !current)} />
                        <Show when={isShown} fallback="fallback">
                            {() => obj.text}
                        </Show>
                    </div>
                </div>
            </div>
        </div>
    );
};
