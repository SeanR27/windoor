# Providers

<!-- App-wide provider composition belongs in this folder. -->

The future root provider will create one TanStack `QueryClient`, wrap the app in `QueryClientProvider`, and optionally render development tools. Add other global providers only when they are truly application-wide.
