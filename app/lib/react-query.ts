import { type DefaultOptions, QueryClient } from "@tanstack/react-query";

export const defaultQueryClientOptions = {
  queries: {
    staleTime: 1 * 60 * 1000,
    gcTime: 1 * 60 * 1000,
  },
} satisfies DefaultOptions;

export const queryClient = new QueryClient({
  defaultOptions: defaultQueryClientOptions,
});