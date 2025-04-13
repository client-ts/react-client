import {QueryState, QueryStateRaw} from "../react/createQueryEngine";

export function $createState<Response>(state: QueryStateRaw<Response>): QueryState<Response> {
    return {
        ...state,
        isError: state.status === "error",
        isLoading: state.status === "loading" || state.status === "idle",
        isOk: state.status === "ok",
        isSuccess: state.status === "ok" && state.result != null && state.result.data != null
    }
}
