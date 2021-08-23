/* eslint-disable fp/no-class, fp/no-this */

type Loader<Result> = () => Promise<Result>;

/**
 * Allows handling of a asynchronous loader function in a way that
 * integrates natively with React Suspense.
 */
export class SuspenseResource<Result> {
  private readonly loader: Loader<Result>;

  private result: Result | null = null;

  private error: unknown | null = null;

  private promise: Promise<Result> | null = null;

  public constructor(loader: Loader<Result>) {
    this.loader = loader;
  }

  /**
   * Loads the resource.
   * Checks if we already have the result, and if so returns it.
   * Checks if we already have a promise, and if so returns it.
   * Otherwise we set the promise from the loader.
   */
  public async load(): Promise<Result> {
    // We already have the result, nothing left to do, return the result.
    if (this.result !== null) return this.result;

    // If promise is already set, return it.
    if (this.promise !== null) return this.promise;

    this.promise = this.loader();

    try {
      const result = await this.promise;
      this.result = result;

      return result;
    } catch (error: unknown) {
      this.error = error;

      throw error;
    }
  }

  /**
   * React Suspense friendly method that:
   * 1. If the result is not available, throws a promise which results in React "Suspending".
   * 2. If an error occurs, throws the error and triggers an Error boundary in React.
   * 3. If the result is available, returns it.
   */
  public read(): Result {
    /* eslint-disable @typescript-eslint/no-throw-literal */
    if (this.result !== null) return this.result;
    if (this.error !== null) throw this.error;
    if (this.promise !== null) throw this.promise;

    // This line should never be reached, but just in case.
    throw this.load();
    /* eslint-enable @typescript-eslint/no-throw-literal */
  }
}
