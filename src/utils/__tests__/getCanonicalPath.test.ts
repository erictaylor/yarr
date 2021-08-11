import { getCanonicalPath } from '../getCanonicalPath';

describe('getCanonicalPath', () => {
  it('should return passed argument when starts with "/"', () => {
    expect(getCanonicalPath('/')).toEqual('/');
    expect(getCanonicalPath('/foo')).toEqual('/foo');
  });

  it('should prepend leading "/" on passed argument without starting "/"', () => {
    expect(getCanonicalPath('*')).toEqual('/*');
    expect(getCanonicalPath('foo')).toEqual('/foo');
    expect(getCanonicalPath(':id')).toEqual('/:id');
  });
});
