import {Client, ClientBuilder, Result, RouteDef} from "@client.ts/core";
import {useState, useRef} from "react";

export type QueryState = "unused" | "loading" | "error" | "aborted" | "ok";
export const createQueryEngine = function <C extends ClientBuilder>(client: Client<C>) {
    const useRoute = function <
        R extends keyof C,
        RR extends keyof C[R]['routes'],
        Response extends (C[R]['routes'][RR] extends RouteDef<infer Response, infer Args> ? Response : never)
    > (resource: R, route: RR) {
        const abortController = useRef(new AbortController());
        const [state, setState] = useState({
            status: "unused" as QueryState,
            result: null as (Result<Response> | null),
            error: null as any
        });

        const query = function <
            Args extends C[R]['routes'][RR] extends RouteDef<infer Response, infer Args> ? Args : never
        >(...args: Args) {
            if (state.status === "loading") {
                abortController.current.abort();
            }

            abortController.current = new AbortController();
            setState({ status: "loading", result: null, error: null});

            const routeDef = client[resource][route as string] as (...args: Args) => Promise<Result<Response>>;

            routeDef(...args)
                .then((result) => {
                    setState({
                        status: "ok",
                        result: result,
                        error: null
                    });
                })
                .catch((err) => {
                    setState({
                        status: "error",
                        result: null,
                        error: err
                    });
                });
        }

        return [query, state] as const;
    }
    return { useRoute } as const;
}
