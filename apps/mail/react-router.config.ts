import type { Config } from '@react-router/dev/config';

export default {
  ssr: !!process.env.DOCKER_BUILD,
  buildDirectory: 'build',
  appDirectory: 'app',
  routeDiscovery: {
    mode: 'initial',
  },
  prerender: ['/manifest.webmanifest'],
  future: {
    unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
