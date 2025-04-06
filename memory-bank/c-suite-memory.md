# C-Suite Project Memory Bank

This document summarizes key information about the C-Suite project based on the knowledge graph.

## Entities

### People
- **Marshal Tudu:** Owner of the system, Software developer.

### Software & Technologies
- **MCP_Memory_Server:** Stores knowledge graph data.
- **Next.js:** React framework (v15) used for routing (App Router), server/client components, API routes.
- **React:** UI library (v19).
- **TypeScript:** Adds static typing to JavaScript.
- **Tailwind CSS:** Utility-first CSS framework (v3.4.1).
- **Shadcn/ui:** Reusable UI components built with Radix UI and Tailwind CSS.
- **Supabase:** Backend-as-a-Service (Authentication via `@supabase/ssr`, Database via `@supabase/supabase-js`).
- **Framer Motion:** Animation library.
- **Zod:** Schema definition and validation library.
- **ai (Vercel AI SDK):** Used for AI stream handling (e.g., in chat).
- **ollama:** Library for interacting with local Ollama models.
- **tesseract.js:** JavaScript library for OCR (Optical Character Recognition).

### Files & Components (Recent Fixes)
*(Note: The following files had TypeScript errors fixed recently)*
- **app/_chatComponents/MyAccountDialog.tsx:** Fixed index signature type error.
- **app/_chatComponents/PastedContent.tsx:** Added `PastedContentProps` interface.
- **app/_chatComponents/SettingsDialog.tsx:** Added `SettingsDialogProps` interface and `User` type for state.
- **app/_chatComponents/UploadProgress.tsx:** Added `UploadProgressProps` interface.
- **app/_components/Header.tsx:** Typed `user` state with `User | null`.
- **app/_context/ChatPreviewsContext.tsx:** Added `ChatPreviewsProviderProps` interface and typed `chatPreviews` state.
- **app/_hooks/useAuth.ts:** Typed `user` state with `User | null`.
- **app/_hooks/useChatHistory.ts:** Added types for parameters, state (`chatHistory`), interfaces (`ChatItem`, `ChatMessage`, `PersonData`), and refs.
- **app/_hooks/useFileHandling.ts:** Typed state (`attachments`, `pastedContent`), event parameters, index parameter, interfaces (`AttachmentFile`), corrected toast calls, reverted to `FileReader`.
- **app/api/account-details/route.ts:** Typed request parameter and added type checking in catch blocks.
- **app/api/chat-history/route.ts:** Typed request parameter and added type checking in catch blocks.
- **app/api/chat/route.ts:** Typed request parameter, added `ChatRequestBody` interface, refactored `streamText` usage, added type checking in catch block.
- **app/api/last-chats/route.ts:** Typed request parameter, added `LastChatResult` interface, typed RPC data, added type checking in catch block.
- **app/login/action.ts:** Added `LoginUserParams` interface for function parameters.
- **app/login/login-form.tsx:** Inferred form values type from Zod schema, typed `serverError` state, added type argument to `useForm`.
- **app/login/page.tsx:** Used 'any' type workaround for `PageProps` constraint, corrected `redirectUrl` logic.
- **app/office/[roleType]/[roleSlug]/page.tsx:** Added `RoleData` interface, typed function parameters, used 'any' type workaround for `PageProps` constraint.
- **app/office/[roleType]/[roleSlug]/RoleChatClient.tsx:** Added interfaces (`RoleData`, `RoleChatClientProps`, `AttachmentDataForApi`), typed refs, fixed `useChat` types, refactored submit logic, typed event handlers, removed attachments from initial `useChat` body.
- **app/_components/OfficeData.tsx:** Added index signatures to `demoExecutiveMessages` and `demoEmployeeMessages`.
- **app/register/action.ts:** Added `RegisterUserParams` interface for function parameters.
- **app/register/page.tsx:** Added `SignupPageProps` interface (using 'any' workaround for `PageProps`), corrected `redirectUrl` logic.
- **app/register/signup-form.tsx:** Inferred form values type from Zod schema, typed `serverError` state, added type argument to `useForm`.

## Relations

*(Note: This section lists relationships between the entities above, derived from the knowledge graph)*

- `app/login/login-form.tsx` uses `app/login/action.ts` (for login logic).
- `app/register/signup-form.tsx` uses `app/register/action.ts` (for signup logic).
- `app/office/[roleType]/[roleSlug]/RoleChatClient.tsx` uses `app/_hooks/useChatHistory.ts`.
- `app/office/[roleType]/[roleSlug]/RoleChatClient.tsx` uses `app/_hooks/useFileHandling.ts`.
- `app/office/[roleType]/[roleSlug]/RoleChatClient.tsx` uses `app/api/chat/route.ts` (via `useChat`).
- `app/_hooks/useChatHistory.ts` interacts with `app/api/chat-history/route.ts`.
- `app/_hooks/useAuth.ts` interacts with Supabase Auth.
- `app/api/...` routes interact with Supabase (Auth and DB).
- Components under `app/_chatComponents/`, `app/_components/`, `app/login/`, `app/register/`, `app/office/` use Shadcn/ui components.
- Components use Tailwind CSS classes for styling.
- Components use Framer Motion for animations.
- Forms (`login-form.tsx`, `signup-form.tsx`, etc.) use `react-hook-form` and `zod` for validation.

*(This is a summary; the full graph contains more detailed relationships)*
