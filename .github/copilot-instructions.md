# GitHub Copilot Custom Instructions

## overview

This is a Next.js application (using the next.js app router), using the Node.js runtime, and it will get deployed on Vercel
Our code is hosted on GitHub

## code structure

- `app/`: next.js app router main directory
- `components/`: react components library
- `helpers/`: reusable utility functions
- `hooks/`: custom React hooks
- `utils/`: utility functions including Supabase and tailwind

## react 19 components

- Follow React 19 best practices with functional components and hooks
- Keep components small and focused on a single responsibility
- Use proper type definitions for all props and state
- Implement error handling for all API calls and 3D rendering
- After making changes to code inside hooks always remember to verify that the dependencies array has been updated accordingly

## next.js 15

- Make sure all knowledge you use is exclusively about Next.js 15 (and not any previous versions)
- Follow Next.js app router and api route handler best practices (ignore Next.js pages router and api pages)

## UI, themes and design

- The user can chose between dark and light theme, so make sure any design changes work well with both
- Use tailwind css for styling
- use shadcn UI for styling components
- Implement responsive and beautiful design pattern, follow best practices in terms of UX for all UI components
- when adding shadcn ui components to the project always use the command "npx shadcn@latest add COMPONENT_NAME", replace COMPONENT_NAME with the name of the component you want to add
- never ever put any components into the components/ui folder, that folder is reserved for components that get installed by shadcn

## caching

Use proper caching strategies using the Next.js 15 dynamicIO experimental feature:

- Use the 'use cache' directive when adding cache to pages
- Use the "cacheLife" function in combination with the "use cache" directive where it makes sense
- use the "cacheTag" function where it makes sense, to cache content
- use a caching strategy that does not just set the cache but also makes sure to ask Next.js to clear the cache when it makes sense and or set content to be revalidated

## forms

- Forms should have both client and backend validation
- Validation is done using zod (isomorphic validation that gets written once but applied to both frontend and backend)
- Forms should use server actions, but to allow client validation we also use a onSubmit, which then does client validation and if it passes then uses a React startTransition that then calls formAction(formData)
- Make sure you use React useOptimistic when it makes sense

## accessibility

- Ensure you follow "Web Content Accessibility Guidelines (WCAG) 2.2" in terms of accessibility for all components
- Accessibility is not just optional, it is a must have

## backend

- Implement proper error handling for all backend calls
- Use environment variables for sensitive information
- when answering questions about node.js or when using node.js modules in the code

## typescript & types

- The project is written in typescript, meaning you should always create .ts and .tsx TypeScript files (not javascript)
- It is very important that you use typescript and follow typescript best practices
- Also write the best possible types for the code you add, also follow best practices regarding types (meaning you should for example try to makes types definitions reusable instead of adding the same or a similar interface to multiple files)

## linting

- analyze the content of the "eslint.config" file (which is located in the root of the project) to make sure you understand which linting rules get used and which are disabled
- Linting has stylistic rules from the @stylistic/eslint-plugin package
- For example one important stylistic rule is to NOT add semicolons at the end of typescript code lines (for situations where semicolons are optional, except in situations where they are required)
- Another example is the stylistic rule to use single quotes in the code (except for html attributes as well as attributes in JSX, which should use double quotes)
- Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`)
- when I tell you to lint always use the "npm run lint-fix" command and after the linting is done fix the problems one by one

## comments

- Try to not remove existing comments (left by previous developers as note to self) unless you delete all the related code
- Start all comment messages with a lowercase letter (not capital letter, we are not writing literature but code)

## editor coding style

- Read the content of the .editorconfig file and make sure you follow the rules listed in that file regarding things like indentation spaces

## packages

- Make sure you always use npm to manage packages
- Make sure you read the content of the package.json file and then make sure you use documentation that matches the package version (so for example if React 19 is installed don't suggest deprecated React 18 code)
- Make suggestions based on already installed packages (when thinking about adding or changing packages make sure you know which ones are already in use)

## console logs

- when using template literals (template strings) in console.log, make sure you don't forget to use .toString() for variables that contain a value that is of type number