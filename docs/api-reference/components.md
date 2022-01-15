# Components

## RouterProvider

The `RouterProvider` component holds the Yarr router context and is responsible for passing it down to underlying components. This component should be used at a level higher than the page components. It takes the router object as props and passes it down. 

### Usage

1. Create a router object using a routes object and other options

```jsx
// routes is an array of objects describing which component
// to load for which url location.
const router = createBrowserRouter({
  routes,
  awaitComponent: true
});
``` 
2. Pass the router object into `RouterProvider` as prop.

```jsx
 <RouterProvider router={router}>
   <App/>          
 </RouterProvider>
```

### Link

The Link component allows a user to transition to a different url location within the app. 

#### Usage

Once the `Link` component is imported from `yarr`, it can be used like so. 

```jsx
import { Link } from "yarr";

export const Navbar = () => (
  <nav>
    <Link to="/">Home</Link>
    <Link to="/continents">Continents</Link>
  </nav>
);
```

#### Intent based preloading

The Link component additionally handles "intent" preloading. A mouseover on a link will preload code while a mousedown will preload code and data, which makes the overall preloading process a touch faster. 

## RouteRenderer

The `RouteRenderer` component is responsible for rendering a component matching the path. It uses the `routes` array configuration and renders the component which matches the URL. 

Example usage is [here](/docs/guides/1-step-by-step-guide.md).
