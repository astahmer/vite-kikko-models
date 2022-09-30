import "./App.css";

import { Container, MantineProvider } from "@mantine/core";

import { Demo } from "./components/Demo";

function App() {
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <MantineProvider withGlobalStyles withNormalizeCSS>
                <Container py="xl">
                    <Demo />
                </Container>
            </MantineProvider>
        </div>
    );
}

export default App;
