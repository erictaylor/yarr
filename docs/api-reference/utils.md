# Utils


## createBrowserRouter, createHashRouter and createMemoryRouter

These utils are used to create a `yarr` router. 

They take in the `routes` configuration array (along with other options)and return a `router` like so. 

```jsx
const router = createBrowserRouter({
  routes,
  awaitComponent: true
});
```

### Differences between the router types

`createBrowserRouter` creates a `yarr` router with `browserHistory`. These are the traditional URLs. 

**Eg**: `/a/b/c`

--- 
`createHashRouter` creates a `yarr` router with `hashHistory`. These are the URLs which are preceded by #. 

**Eg**: `app/#a/b/c` 

HashHistory is useful when large apps are joined together and are managed independently. For eg, if 3 apps were to live at `/app1`, `/app2`, `/app3`, the sub parts of `/app1` will reside at `/app1/#home`, `/app1/#about` etc. 

--- 
`createMemoryRouter` creates a `yarr` router with `memoryHistory`. This router is generally used in `mobile apps` where there are no URLs or in testing scenarios.


### Options

The above utils take in `assistPreload`,  `awaitComponent`, `awaitPreload`, and `logger` as optional properties.  

`awaitComponent` and `awaitPreload` is discussed in detail in the [performance section](/docs/advanced/performance-and-ux.md).

---
** Note:** Documentation for SuspenseResource is WIP.
