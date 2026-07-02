import { createTheme, virtualColor, rem } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: 6,
  colors: {
    brand: virtualColor({
      name: 'brand',
      light: 'cyan',
      dark: 'cyan',
    }),
  },
  defaultRadius: 'md',
  fontFamily:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", "Fira Code", monospace',
  headings: {
    fontFamily: '"Inter", sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontWeight: '800', fontSize: rem(40), lineHeight: '1.05' },
      h2: { fontWeight: '750', fontSize: rem(28), lineHeight: '1.15' },
      h3: { fontWeight: '700', lineHeight: '1.2' },
      h4: { fontWeight: '650', lineHeight: '1.25' },
    },
  },
  other: {
    brandGradient:
      'linear-gradient(135deg, #0f766e 0%, #176b87 100%)',
    brandGradientLight:
      'linear-gradient(135deg, #14b8a6 0%, #38bdf8 100%)',
    logoHeight: rem(80),
    logoWidth: rem(80),
    logoRadius: rem(20),
  },
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
})
