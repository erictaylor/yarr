# Redirect Rules for routes

Redirection at the route config level is super easy with Yarr. The Routes configuration object allows a user to specify a redirection from a route. It also allows redirection to be conditional.

### What is the `redirectRules` field and why use it?

`redirectRules` is a field in Yarr's route configuration object which

- is run before any preload logic or component render.
- takes a function where you can perform logic to conditionally determine if the router should redirect the user to another route.
  - The function should return the full `pathname` of the route to redirect to, or `null` if no redirect should occur.
  - Since this function executes before any preloading occurs, it helps avoid unnecessary data/component preloading in the case of redirection which is a big performance win.

**NOTE**: redirect rules apply to children routes unless overridden.

The code sandbox below covers various redirection examples mentioned in this guide. ⬇️

[Open Codesandbox](https://codesandbox.io/embed/typescript-react-yarr-redirectrules-example-m1nyu?fontsize=14&hidenavigation=1&theme=dark)

## Always redirect from one path to another path

There are scenarios where we want to avoid a user from ever landing on a path. It could be for the following reasons

- Feature at the page is deprecated
- Page now has a new location

It is handy in this case to supply a redirection rule at the route level. It can be done with yarr like so.

```jsx
const routes = [{...},
// other routes
{
    path: "/old-path",
    redirectRules: () => "/new-path"
}
// other routes
, {...}]
```

### Demo

In the sandbox linked above, try going to the `Old Users` page linked in the navbar. It will take the user back to the `Users` page as it has been configured to redirect from `/old-users` to `/users` in the routes file. So,

## Redirect conditionally

Sometimes the user should be redirected away from a page in certain conditions only.

### Authentication example

- For eg: There is an authenticated page in the app and we only want a user to enter the page if the user has the `id` of the page and has a `password` to it.
- If the user has both values, allow access and continue preloading the component file and the data needed for the page and render the page.
- Else, take the user back to the home page.

This can be achieved quite easily with Yarr like so.

```jsx
/**
 * A trivial isAuthenticated user example but this
 * function can be anything as long as it can synchronously validate a user.
 * For eg: comparing for a value existing in localStorage or cookies
 * */
const isAuthenticated = ({
  id,
  password,
}: {
  id: string,
  password: string,
}): boolean => {
  return id === '12345' && password === 'yarr';
};

const routes = [
  //other routes
  {
    path: '/secret/:pageId',
    component: async () => {
      const module = await import('./pages/AccessApproved');

      return module.AccessApprovedPage;
    },
    redirectRules: (
      { pageId }: RouteParameters<'/secret/:pageId'>,
      searchParams: Record<string, string[] | string>
    ) => {
      if (
        isAuthenticated({
          id: pageId,
          password: searchParams.password,
        })
      ) {
        return null;
      }
      return '/';
    },
  },
  // ... other routes
];
```

In the function above, we used the `redirectRules` function to access the `route` params and the `search` params of the rendered page and used it to validate the user.

### Demo

- In the sandbox linked above, click the `Incorrect credentials` link in the navbar. Since it has the path `/secret/abc`, it will fail the authentication test and it should redirect back to the home page.

- However, clicking on the the `Correct Credentials` link which has the path `/secret/12345?password=yarr` will allow the user to access the page!
