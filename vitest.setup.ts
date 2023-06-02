import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import 'vitest-dom/extend-expect';

afterEach(() => {
	cleanup();
});

const fetchMock = vi.fn(() => {
	throw new Error(
		'Fetch not available in testing. You need to mock it in the test.',
	);
});

const ResizeObserverMock = vi.fn(() => ({
	disconnect: vi.fn(),
	observe: vi.fn(),
	unobserve: vi.fn(),
}));

vi.stubGlobal('fetch', fetchMock);
vi.stubGlobal('ResizeObserver', ResizeObserverMock);
