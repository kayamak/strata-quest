import { beforeAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

beforeAll(() => {
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
  }));

  vi.mock('next/server', () => ({
    NextRequest: vi.fn(),
    NextResponse: {
      json: vi.fn(),
      redirect: vi.fn(),
    },
  }));
});

afterEach(() => {
  cleanup();
});
