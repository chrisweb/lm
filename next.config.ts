import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    experimental: {
        // React compiler
        reactCompiler: true,
        // experimental partial prerendering
        // https://nextjs.org/docs/messages/ppr-preview
        ppr: false,
        // experimental typescript "statically typed links"
        // https://nextjs.org/docs/app/api-reference/next-config-js/typedRoutes
        // note to self: currently disabled as no turbopack support yet
        //typedRoutes: true,
        // https://nextjs.org/blog/next-15-2#react-view-transitions-experimental
        viewTransition: true,
    },
    // hit or skip data cache logging (dev server)
    // https://nextjs.org/docs/app/api-reference/next-config-js/logging
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    // file formats for next/image
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [240, 336, 480, 704, 1080, 1408, 1920, 2112, 3840],
    },
    // disable linting during builds using "next lint"
    // we have manually added our lint script in package.json to the build command
    eslint: {
        ignoreDuringBuilds: true,
    },
}

export default nextConfig
