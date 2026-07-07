import { chromeLauncher } from '@web/test-runner';

// In CI the container runs as root, where Chromium refuses to start its
// sandbox — pass --no-sandbox there. Local runs keep default flags.
const ciArgs = process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [];

export default {
  nodeResolve: true,
  testFramework: {
    config: {
      timeout: 10000,
    },
  },
  browsers: [
    chromeLauncher({
      launchOptions: {
        args: ciArgs,
      },
    }),
  ],
};
