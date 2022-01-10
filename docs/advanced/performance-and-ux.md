# Performance and User Experience

Yarr is built for the `render-as-you-fetch` pattern and aims to provide a smooth user experience and performance while navigating across pages. This is made possible with `preloading`.

Consider a route object like so. 

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

This route describes that it requires the `Continents` component and the `ContinentsPageQuery` to function. `Yarr` preloads the `component` and the `data` for the route when the transition is request. But the added bonus is that, since `yarr` is built with the `render-as-you-fetch` pattern in mind, it is able to offer various strategies here to tweak the user experience during the `preload` phase. 


## Strategies

Let's briefly discuss common strategies for loading code and data with `yarr`. 

### 1. Basic approach - code and data preloading off

When a router is created like so

```jsx
import {createBrowserRouter} from 'yarr'

const router = createBrowserRouter({
  routes,
  awaitComponent: false,
  awaitPreload: false
});
```

or 

```jsx
import {createBrowserRouter} from 'yarr'

const router = createBrowserRouter({
  routes,  
});
```

the router is in the basic strategy.

### What does this mean?

This means that when a new route is navigated to (eg: `push('/about')`) `yarr` fires the preload requests for the component and data for the `route` immediately. However, it immediately navigates to the `/about` route and doesn't await to check if the `component` or the `data` necessary for the page have been loaded. 

This means that if there are components/data still in-flight then this component tree will suspend and show the fallback `loading message` defined in the nearest `Suspense` ancestor. 


![Basic approach](/docs/assets/basic-approach.png)


Note: Yarr will always fire the requests to preload content. In this case, it simply doesn't wait for the requests to fulfill and the responsibility is on us to deal with the loading states. 

## awaitComponent

When a router is created like so,

```jsx
import {createBrowserRouter} from 'yarr'

const router = createBrowserRouter({
  routes,
  awaitComponent: true,  
});
```

and when a navigation occurs in the app (eg: `push('/about')`) , `yarr` will `await` the `component` responsible for rendering the `/about` route and avoid suspending the app for the `component` preload request. Once the component is fetched, it will render the newly loaded component.

![Awaiting component](/docs/assets/awaiting-component.png)



Note: It will still suspend if the `data` required for this page has not arrived by the time the `component` has loaded.

### What does this mean?

This means that we are able to avoid showing loading indicators for when components are being fetched over the network and continue to show the existing route while it is being fetched.

- Naturally this means that if your static file server (which is responsible for sending the components to the frontend) is slow, it will make the app feel sluggish and slow. 
- At the same time, if the files are hosted on good CDNs where the latency is low, this gives a perception of speed as the component loads quickly and the `loading indicators` are also not shown. 

## awaitPreload

When a router is created like so,

```jsx
import {createBrowserRouter} from 'yarr'


const routes = [{
    path: '/team',
    component: ...,
    preload: () => ({
        query: fetchTeamMembersList(...)
    })
}]

const router = createBrowserRouter({
  routes,
  awaitPreload: true,  
});
```

and when a navigation occurs in the app (eg: `push('/team')`) , `yarr` will `await` the `data` required for the `/team` page to be fetched from the server before rendering the team page component. 

The behavior is analogous to `awaitComponent` but for `data` fetching. 

### Awaiting data and component

Here is how the same chart would look like if we await for both `data` and the `component`

![Awaiting Data and Component](/docs/assets/awaiting-component-and-data.png)



**Note:** It is important to remember that if the responses on the network are slow, the app can feel more sluggish to the user if it continues to show the old route for a continued period of time! 

