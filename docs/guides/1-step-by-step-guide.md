# Step-by-step Guide

This guide will walk you through all the steps to quickly setup and get started with Yarr.  However, if you want to check out the code of the completed guide first, you can do so here ⬇️.

[Open in Codesandbox](https://codesandbox.io/embed/yarr-1-basic-yarr-starter-completed-c8rkuw?fontsize=14&hidenavigation=1&theme=dark)



## Step 1. Create React App

For this guide, we'll start with a create-react-app from here ⬇️. 

[Open in Codesandbox](https://codesandbox.io/embed/yarr-1-basic-yarr-starter-starting-point-t5zl0v?fontsize=14&hidenavigation=1&theme=dark)


## Step 2. Create your route pages

We want to be able to show different components for different paths in the app. Let's start creating the components for each of those routes. We will need a `Home` page, an `About` page and a `NotFound` page. 

Go ahead and create these pages in the `./src/pages` directory in separate files.

1. Home page 

```jsx
export const HomePage = () => <h1> Home </h1>;
```

2. About page

```jsx
export const AboutPage = () => (
  <div>
    <h1> About Us </h1>
    <p> Lorem ipsum </p>
  </div>
);
```

3. NotFound page

```jsx
export const NotFoundPage = () => <p> Not found </p>;
```

## Step 3. Declare your routes 

Now, let's declare the routes for the components created above. We want 
1. The home page to show up on the `/` route
2. The about page to show up on the `/about` route
3. And for all other routes `*`, we want to show the notfound page. 

We can do so by creating an array like so. 
```jsx
export const routes = [
  {
    component: async () => {
      const module = await import('./pages/About');

      return module.AboutPage;
    },
    path: '/about',
  },
  {
    component: async () => {
      const module = await import('./pages/Home');

      return module.HomePage;
    },
    path: '/',
  },
  {
    component: async () => {
      const module = await import('./pages/NotFound');

      return module.NotFoundPage;
    },
    path: '*',
  },
];
```

The `routes` constant is an array of `objects` containing `path` and `component`. Eventually Yarr will decide which component to show based on this. 

The `component` value is a function that returns a dynamic import promise. What this means is that, we map a route component module to a path and Yarr will start loading the component only when a user tries to land on the corresponding `path`. 

This ensures that we only load the components we require for the route we are transitioning to and not load the entire app in one go.


## Step 4. Create the router 

At this point, we have our components and the `path-component` mapping. Now we can create the router. In the entry file `src/index.js`, create the router with the `routes` object like so. 

```jsx

import { routes } from './routes';

const router = createBrowserRouter({
  routes,
});
```

Then wrap the `<App/>` instance with `RouterProvider` to give all your components in the app access to Yarr  router context. 

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider, createBrowserRouter } from 'yarr';
import { routes } from './routes';
import App from './App';


ReactDOM.render(
  <RouterProvider router={router}>
    <App />
  </RouterProvider>,
  document.getElementById('root')
);

```

The `RouterProvider` component is a context provider and wraps the `App` and it's descendants with `Router` context to allow all underlying components and hooks to tap into Yarr. 

## Step 5.  Rendering the routes

Now for the last step. We need to find a place for the routed components to be placed in the `App` component when they are matched.

This is done using the `RouteRenderer` component. It exposes the matched component contents as `Route` and it can be used like so. 

```jsx
import { RouteRenderer } from 'yarr';


<RouteRenderer
  pendingIndicator={<p>...pending loading </p>}
  routeWrapper={({ Route }) => (
     <div>
         <Navbar />
         <div className="route">{Route}</div>
     </div>
   )}
/>
```

- One important thing to remember is that, Yarr uses the "render-as-you-fetch-pattern", which means that it utilizes the React `Suspense` component to suspend parts of the react tree while the component code and route preload data are being fetched. 
- Hence, we need to wrap at least this part of our app with `Suspense`. We can also choose to move the `Suspense` component higher up in the tree to cover other loading scenarios besides Yarr but for now we can just wrap the `RouteRenderer` with `Suspense` like so.

Replace the `App.js` file contents with this snippet below. 

```jsx
import React from 'react';
import './style.css';
import { Suspense } from 'react';
import { RouteRenderer } from 'yarr';
import { Navbar } from './Navbar';

export default function App() {
  return (
    <Suspense fallback={'...loading'}>
      <RouteRenderer
        pendingIndicator={<p>...pending loading </p>}
        routeWrapper={({ Route }) => (
          <div>
            <Navbar />
            <div className="route">{Route}</div>
          </div>
        )}
      />
    </Suspense>
  );
}
```

Check out the app here! ⬇️

[Open in Codesandbox](https://codesandbox.io/embed/yarr-1-basic-yarr-starter-completed-c8rkuw?fontsize=14&hidenavigation=1&theme=dark)

---

