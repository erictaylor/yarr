# Preloading data with Relay

Relay is graphql framework which makes data fetching easy for React. It is an extremely performant library and offers built in tools to easily `preload` data fetching for a GraphQL resource. 

It exposes the `loadQuery` util and the `usePreloadedQuery` hook to empower developers to easily determine the best timing to start fetching data to give the best user experience to end users. 

Note: From this point on, this guide assumes that you are familiar with `Relay basics`.

# Yarr and Relay

Yarr was built with Relay data preloading in mind and works seamlessly with Relay. Let's discuss the steps in this flow.

1. A route object declares the component it requires and the `query` it needs to preload like so 

```jsx
export const routes = [
  {
    component: async () => {
      const module = await import("./pages/Continents");

      return module.ContinentsPage;
    },
    path: "/continents",
    preload: () => ({
      query: loadQuery(RelayEnvironment, ContinentsPageQuery, {})
    })
  },
  ...
]
```
NOTE: Important to know that preload can be any object with any number of keys. The property `query` here is only a convention. This object is passed as props to the component rendered on the route.


2. When the user lands on this route, Yarr begins the preload process for the component and the `data`. 
3. The route component will be passed the a `preloaded` prop which can be used with Relay's `usePreloadedQuery()` hook. It will contain the `query` property defined in step 1. 

```jsx
export function ContinentsPage({ preloaded }) {
  const data = usePreloadedQuery(
    graphql`
      query ContinentsPageQuery {
        continents {
          code
          name
        }
      }
    `,
    preloaded.query
  );
  ...  
```

4. The component will suspend as needed based on the router strategy and the response from the graphql server and continue after data is fulfilled.

--- 

Yarr makes working with Relay a breeze. Checkout the full example below. ⬇️

[Open Codesandbox](https://codesandbox.io/embed/yarr-preloading-data-typescript-4ro4ej?fontsize=14&hidenavigation=1&theme=dark)
