import "./App.css";

import { Container, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Demo } from "./components/Demo";

const queryClient = new QueryClient();

function App() {
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <QueryClientProvider client={queryClient}>
                <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: "dark" }}>
                    <Container py="xl">
                        <Demo />
                    </Container>
                </MantineProvider>
            </QueryClientProvider>
        </div>
    );
}

export default App;
