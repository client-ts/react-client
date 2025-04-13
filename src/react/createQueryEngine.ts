import {Client, ClientBuilder, Result, RouteDef} from "@client.ts/core";
import {useState, useEffect} from "react";
import {$createState} from "../utils/createState";

export type QueryStatus = "idle" | "loading" | "error" | "aborted" | "ok";
export type QueryStateRaw<Response> = {
    status: QueryStatus,
    result: Result<Response> | null,
    error: any
}

export type QueryStateFns = {
    // IsLoading checks whether the status is "loading" or "idle".
    // Generally, you should include "idle" as a loading state as it is what is shown when the query is first created
    // but not triggered, especially on first useEffects.
    isLoading: boolean,
    // IsError checks whether the status is "error" but doesn't necessarily check whether "error" is null.
    isError: boolean,
    // IsOk checks whether the "status" is of "ok".
    isOk: boolean,
    // IsSuccess checks whether the "status" is "ok" and the result has data.
    isSuccess: boolean
}

export type QueryState<Response> = QueryStateRaw<Response> & QueryStateFns;

export const createQueryEngine = function <C extends ClientBuilder>(client: Client<C>) {
    const useRoute = function <
        R extends keyof C,
        RR extends keyof C[R]['routes'],
        Response extends (C[R]['routes'][RR] extends RouteDef<infer Response, infer Args> ? Response : never)
    > (resource: R, route: RR) {
        const [state, setState] = useState($createState({
            status: "idle",
            result: null,
            error: null
        }));

        const query = function <
            Args extends C[R]['routes'][RR] extends RouteDef<infer Response, infer Args> ? Args : never
        >(...args: Args) {
            setState($createState<Response>({ status: "loading", result: null, error: null}));

            const routeDef = client[resource][route as string] as (...args: Args) => Promise<Result<Response>>;

            routeDef(...args)
                .then((result) => {
                    setState($createState<Response>({
                        status: "ok",
                        result: result,
                        error: null
                    }));
                })
                .catch((err) => {
                    setState($createState<Response>({
                        status: "error",
                        result: null,
                        error: err
                    }));
                });
        }

        return [query, state] as const;
    }

    const useImmediatelyFiringRoute = function <
        R extends keyof C,
        RR extends keyof C[R]['routes'],
        Args extends C[R]['routes'][RR] extends RouteDef<infer Response, infer Args> ? Args : never
    > (resource: R, route: RR, ...args: Args) {
        const [query, state] = useRoute(resource, route);
        useEffect(() => {
            query(...args);
        }, []);

        return state;
    }

    return { useRoute, useImmediatelyFiringRoute } as const;
}
