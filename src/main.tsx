import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { Web3Provider } from "./helpers/Web3Provider.tsx";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<Web3Provider>
				<ConnectKitProvider>
					<App />
				</ConnectKitProvider>
			</Web3Provider>
		</QueryClientProvider>
	</StrictMode>,
);
