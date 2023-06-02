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

## Getting Started

- [Step-by-step guide](/docs/guides/1-step-by-step-guide.md)

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

## Acknowledgements

**Yarr** was originally developed by [Eric Taylor](https://github.com/erictaylor) at [Contra](https://www.contra.com) to power Contra's [Relay](https://relay.dev) (_formally Relay Modern_) and React Suspense tech stack. It's since been open-sourced to give back to the community and promote Relay/Suspense adoption.

## License

[MIT](/LICENSE.md) © [Eric Taylor](https://github.com/erictaylor)
