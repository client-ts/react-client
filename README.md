# Client.ts for React

**The Redux Toolkit-inspired HTTP Client for Typescript Applications**

[![npm version](https://img.shields.io/npm/v/@client.ts/core?color=blue&label=Latest%20Version)](https://www.npmjs.com/package/@client.ts/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?logo=typescript&logoColor=white)

**Simplify your HTTP requests and centralize your API logic with Client.ts, a lightweight, Redux Toolkit-inspired HTTP client designed for TypeScript.**

This module of Client.ts implements simplified React querying support, and works with React Native and the web without any changes needed.

## Using Client.ts for React

Installation:
```shell
npm install "@client.ts/react"
```

This guide assumes that you understand and already use Client.ts:

```ts
import {createQueryEngine} from "./createQueryEngine";

// This assumes that you already have a Client.ts instance existing.
// To get started with the React module, simply declare these two lines anywhere.
export const {useRoute} = createQueryEngine(client);
```

Then use that `useRoute` in any React component. Note that a `useRoute` instance will have its own `query` function and 
a `state` object which reflects the state of the `query` function called, therefore, you cannot execute the `query` function 
twice unless the function is already finished, otherwise it overrides it. You can, however, use more than one `useRoute` instance in the same component, and they will work independently of each other.

```tsx
import {useEffect} from "react";

export default function Test() {
    // In this example, we use the route called "route" under the resource called "resource".
    const [query, state] = useRoute("resource", "route");

    useEffect(() => {
        query("args can be put here, it should be properly typechecked");
    }, []);

    if (state.status === "unused" || state.status === "loading") {
        return (<p>Loading...</p>);
    }

    if (state.status === "error") {
        return (<p>An error occurred: {state.error}</p>)
    }

    return (
        <div>
            <h1>Data</h1>
            <pre>{JSON.stringify(state.data, null, 2)}</pre>
        </div>
    )
}
```
