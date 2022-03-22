# yarr

<h1 align="center" aria-label="yarr">
  <img src="docs/assets/yarr-banner.png" width="840px">
</h1>

A React router library enabling the render-as-you-fetch concurrent UI pattern.

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Usage Examples](#usage-examples)
- [API reference](#api-reference)
- [License](#license)

## Overview

**Yarr** is _yet another React router_ library, but with a focus on enabling the [render-as-you-fetch concurrent UI pattern](https://reactjs.org/docs/concurrent-mode-suspense.html) by offering both component **code preloading** and **data preloading**. This behavior is enabled even without opt-in to [React's experimental Concurrent Mode](https://it.reactjs.org/docs/concurrent-mode-intro.html).

Yarr was originally developed for use with [Relay](https://relay.dev) (_formally Relay Modern_) in September 2020 for internal use at [Contra](https://www.contra.com). It's since been open-sourced to give back to the community and promote Relay adoption.

## Getting Started

- [Step-by-step guide](/docs/guides/1-step-by-step-guide.md)

Community articles:

- [Getting started with Yarr!](https://medium.com/nerd-for-tech/getting-started-with-yarr-7d864266b9d1)
- [Yarr (yet another react router) | Let’s get started | Great react routing library](https://suneetbansal.medium.com/yarr-yet-another-react-router-lets-get-started-great-react-routing-library-3e550c0834d7)
- [Yarr와 Relay를 이용해 Render-as-you-fetch 라우팅을 구현하기](https://velog.io/@jaeholee/render-as-you-fetch-using-yarr-and-relay)
- [Is Yarr just another React Router?](https://medium.com/front-end-weekly/is-yarr-just-another-react-router-3208d6cdceda)

## Usage Examples

- [Parameterized Routing example](/docs/guides/2-parameterized-routing.md)
- [Preloading data with Relay example](/docs/guides/3-preloading-data-with-relay.md)
- [Redirect Rules](/docs/guides/4-adding-redirect-rules-to-routes.md)

## Advanced

- [Performance and UX with Yarr](/docs/advanced/performance-and-ux.md)

## API Reference

- [Components](/docs/api-reference/components.md)
- [Hooks](/docs/api-reference/hooks.md)
- [Utils](/docs/api-reference/utils.md)

## License

[MIT License](/LICENSE)
