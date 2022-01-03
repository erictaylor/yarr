# Hooks

## useNavigation

This hook exposes all the navigating capabilities of Yarr. 

```jsx
import {useNavigation} from 'yarr'

// in a hook/component
const navigation = useNavigation();
```

The `navigation` object contains the following methods

| Method      | Description |
| ----------- | ----------- |
| push     | Pushes a new history entry on to the history stack and navigates to that route           |
| go(n: number)    | Moves the history stack pointer by n entries            |
| replace     |  Replaces the current history entry with a new location and navigates          |
| block     | Blocks all navigation until unblocked.            |
| back     |  Goes back to the previous location if it exists. Equivalent to `go(-1)`          |
| forward     |  Goes to the next location if it exists. Equivalent to `go(1)`           |
--- 

While the `Link` component is very convenient to use, it only renders an `anchor` element. This hook `useRouteProps` can make navigation easy with any component. For eg, 

### Navigation when a button is clicked

```jsx
const navigation = useNavigation()
const goToAboutPage = () => {
    navigation.push(`/about`);
}

<button onClick={goToAboutPage}> Go to About Page </button>
```

### History entries with more information

Besides navigation using string location descriptors like `/about`. Methods like `push` and `replace` also accept objects to describe locations. 

- The location descriptors can include the `pathname`, `search` query property and the `state` property within the object in the transition. 


For eg: 

```
navigation.push({
    pathname: `/about`,
    search: `?a=5&b=6`,
    state: {
      firstVisitToPage: 1  
    }
})
```


## useRouteProps
`useRouteProps` , a very commonly used hook, can be used to access information related to the current active route. 

### Usage

```jsx
const {params, search, preloaded} = useRouteProps();
```
---

### Params example

Let us consider an app which has a user profile route `/user/:username`. 

Now when the user is on the URL `/user/lee`, then in a component, that is rendered on that route,

```jsx
const {params} = useRouteProps();
console.log(params.username) // lee
```

NOTE: `useRouteProps` gives access to `params` for the current active route. But be careful. `params.username` here could be undefined.
It's important to note that usage of useRouteProps() doesn't guarantee the params are available because the usage could be on any route.
Using params passed to the page components is a guarenteed way of getting param props.


### Search example

The `search` value is useful to grab `location.search` when present in the URL.

If the app is on the URL `/path?a=1&b=2&b=3`, then

```jsx
const {search} = useRouteProps();
console.log(search.a) // "1"
console.log(search.b) // ["2","3"]
```

*Note*: This can be of type `string | string[] | undefined`. In other words, it can be `undefined`, a single string, or an array of strings. It is up to the developer to handle the type of the data returned from this value and parse it into a convenient format.


## useRouter

`useRouter` exposes the `RouterContext` to underlying components. Some common utilities of this hook include
1. Whether a particular path is currently `active` 
2. To subscribe to page transitions and perform actions (useful for analytics)

### Checking if a path is active
```jsx
const {isActive} = useRouter();

// This will return true if the path matches `/about`
const isAboutPageActive = isActive(`/about`); 
```

### For analytics

Within a component that is a descendant of the `RouterProvider` component. 

```jsx
const Component = () => {

const { getCurrentRouteKey, subscribe } = useRouter();

useEffect(() => {
  const unsubscribe = subscribe({
    onTransitionStart: (_, {location}) => {     
       someAnalytics(location.pathname)
    }
  })
  return unsubscribe
})

return </>
}

```

--- 

## useBlockTransition

Calls a `blocker` callback if a condition passed as argument ( called `toggle`) is true when one of the following scenarios occurs:
1. A user attempts to navigate away from the web app
2. A user hits the reload button in their browser

This is useful when users are in the middle of filling a form or performing an action and accidentally navigate away from the current url and allows the app to request a confirmation to navigate away.

**NOTE**: Please note that any other user interactions that you may want to block if `toggle` is true are
  the responsibility of the implementation. This only handles browser/history events. Also, this does not currently work on mobile devices.

---

## useHistory

This hook exposes access to the `history` object. It can be used in scenarios where the `history` object is required. 

For eg:

```jsx
const history = useHistory();
console.log(history.location.state)
// Or to listen to history events
useEffect(() => {
    history.listen...
})
```

The `history` object is created from the [npm history library](https://www.npmjs.com/package/history). Check out [history docs](https://github.com/remix-run/history/tree/dev/docs) for more information.
