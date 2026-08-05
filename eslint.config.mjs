import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

/**
 * `eslint-config-next` ships native flat configs as of 16, so there is no
 * FlatCompat shim here.
 *
 * eslint is pinned to 9.x on purpose: eslint-plugin-react 7.37, which
 * eslint-config-next depends on, crashes on eslint 10 (`getFilename is not a
 * function` while loading `react/display-name`).
 */
const config = [
  {
    ignores: [
      '.next/**',
      '.claude/**', // git worktrees live here; they carry their own build output
      'out/**',
      'cdktf.out/**',
      'demos/**', // real TerraConstructs apps kept as fixtures, not site source
      'node_modules/**',
      'public/**',
      'next-env.d.ts',
    ],
  },

  ...coreWebVitals,
  ...typescript,

  {
    rules: {
      // A leading underscore is this repo's marker for a deliberately unused
      // binding — destructuring a field off an object purely to drop it.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },

  {
    // The CloudFront viewer-request function is uploaded via `toString()` and
    // runs on the cloudfront-js runtime, which is ES5. `var` is required there,
    // not a style slip — see the comment above `handler` in this file.
    files: ['infra/main.ts'],
    rules: {
      'no-var': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },

  {
    // Both are the standard next-themes/route-change guards: set a flag once on
    // mount, or reset local state when the path changes. React's newer rule
    // wants neither expressed as an effect. Left as-is rather than refactored
    // blind — worth revisiting, but not while it renders correctly.
    files: ['components/site/theme-toggle.tsx', 'components/workshop/workshop-nav-drawer.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default config
