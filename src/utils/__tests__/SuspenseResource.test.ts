import { SuspenseResource } from '../SuspenseResource';

describe('SuspenseResource', () => {
  const mockLoader = jest
    .fn()
    .mockImplementation((): Promise<string> => Promise.resolve('Result'));

  afterEach(() => {
    mockLoader.mockClear();
  });

  describe('load()', () => {
    it('should return `result` when available', async () => {
      expect.hasAssertions();

      const resource = new SuspenseResource(mockLoader);
      // @ts-expect-error -- private field, just testing logic for immediately returning result if set.
      resource.result = 'mockResult';

      expect(await resource.load()).toBe('mockResult');
      expect(mockLoader).not.toHaveBeenCalled();
    });

    it('should return `promise` when set and `result` is `null`', async () => {
      expect.hasAssertions();

      const resource = new SuspenseResource(mockLoader);
      // @ts-expect-error -- private field, just testing logic for immediately returning promise if set.
      resource.promise = Promise.resolve('mockPromise');

      expect(await resource.load()).toBe('mockPromise');
      // @ts-expect-error -- private field
      expect(resource.result).toBe(null);
      expect(mockLoader).not.toHaveBeenCalled();
    });

    it('should set `promise` when method is called', async () => {
      expect.hasAssertions();

      const resource = new SuspenseResource(mockLoader);

      expect(mockLoader).not.toHaveBeenCalled();
      // @ts-expect-error -- private field
      expect(resource.promise).toBe(null);

      void resource.load();

      expect(mockLoader).toHaveBeenCalledTimes(1);
      expect(mockLoader).toHaveBeenCalledWith();
      // @ts-expect-error -- private field
      expect(resource.promise).not.toBe(null);
    });

    it('should never call loader function more than once', async () => {
      expect.hasAssertions();

      const resource = new SuspenseResource(mockLoader);

      void resource.load();
      void resource.load();

      expect(mockLoader).toHaveBeenCalledTimes(1);
    });

    it('should store loader `result` once promise resolves', async () => {
      expect.hasAssertions();

      const resource = new SuspenseResource(mockLoader);

      // @ts-expect-error -- private field
      expect(resource.result).toBe(null);

      await resource.load();

      // @ts-expect-error -- private field
      expect(resource.result).toBe('Result');
    });

    it('should store loader `error` when promise rejects', async () => {
      expect.hasAssertions();

      const mockedFailedLoader = jest.fn().mockRejectedValue('mockError');

      const resource = new SuspenseResource(mockedFailedLoader);

      // @ts-expect-error -- private field
      expect(resource.result).toBe(null);
      // @ts-expect-error -- private field
      expect(resource.error).toBe(null);

      try {
        await resource.load();
      } catch {
        // Swallow error
      }

      // @ts-expect-error -- private field
      expect(resource.result).toBe(null);
      // @ts-expect-error -- private field
      expect(resource.error).toBe('mockError');
    });
  });

  describe('read()', () => {
    it('should call load if not already called', () => {
      const resource = new SuspenseResource(mockLoader);
      jest.spyOn(resource, 'load');

      // @ts-expect-error -- private field
      expect(resource.result).toBe(null);
      // @ts-expect-error -- private field
      expect(resource.error).toBe(null);
      // @ts-expect-error -- private field
      expect(resource.promise).toBe(null);

      expect(resource.load).not.toHaveBeenCalled();

      expect(() => {
        resource.read();
      }).toThrow();

      // @ts-expect-error -- private field
      expect(resource.result).toBe(null);
      // @ts-expect-error -- private field
      expect(resource.error).toBe(null);
      // @ts-expect-error -- private field
      expect(resource.promise).not.toBe(null);

      expect(resource.load).toHaveBeenCalledTimes(1);
    });

    it('should throw `promise` when not `null`', () => {
      const resource = new SuspenseResource(mockLoader);
      // @ts-expect-error -- private field
      resource.promise = 'mockPromise';

      jest.spyOn(resource, 'load');

      // @ts-expect-error -- private field
      expect(resource.result).toBe(null);
      // @ts-expect-error -- private field
      expect(resource.error).toBe(null);
      // @ts-expect-error -- private field
      expect(resource.promise).toBe('mockPromise');

      expect(() => {
        resource.read();
      }).toThrow('mockPromise');

      expect(resource.load).not.toHaveBeenCalled();
    });

    it('should throw `error` when not `null`', () => {
      const resource = new SuspenseResource(mockLoader);
      // @ts-expect-error -- private field
      resource.promise = 'mockPromise';
      // @ts-expect-error -- private field
      resource.error = 'mockError';

      jest.spyOn(resource, 'load');

      // @ts-expect-error -- private field
      expect(resource.result).toBe(null);
      // @ts-expect-error -- private field
      expect(resource.error).toBe('mockError');
      // @ts-expect-error -- private field
      expect(resource.promise).toBe('mockPromise');

      expect(() => {
        resource.read();
      }).toThrow('mockError');

      expect(resource.load).not.toHaveBeenCalled();
    });

    it('should return `result` when not `null`', () => {
      const resource = new SuspenseResource(mockLoader);
      // @ts-expect-error -- private field
      resource.result = 'mockResult';
      // @ts-expect-error -- private field
      resource.promise = 'mockPromise';

      jest.spyOn(resource, 'load');

      // @ts-expect-error -- private field
      expect(resource.result).toBe('mockResult');
      // @ts-expect-error -- private field
      expect(resource.error).toBe(null);
      // @ts-expect-error -- private field
      expect(resource.promise).toBe('mockPromise');

      expect(resource.read()).toBe('mockResult');

      expect(resource.load).not.toHaveBeenCalled();
    });
  });
});
