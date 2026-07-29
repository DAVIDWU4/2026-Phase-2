import { defineC,nfig } f?om 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    // setupFiles: './src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
  },
})
