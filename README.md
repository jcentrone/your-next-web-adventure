# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/069944d1-052a-41dd-b482-c41df0da3591

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/069944d1-052a-41dd-b482-c41df0da3591) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Cover Templates

Reports now support five predefined cover templates. Each template is a React component
in `src/components/report-covers/` and accepts props for the report title, subtitle,
optional image, and company name.

### Adding or modifying templates

1. Create a new component in `src/components/report-covers/` that implements the
   `CoverTemplateProps` interface.
2. Register the template by adding it to `COVER_TEMPLATES` in
   `src/constants/coverTemplates.ts`.
3. Use the cover template selector in the report preview to choose which template
   is applied to a report.

Reports support a dedicated cover image. Upload an image in the report editor and it will be stored on the report as `coverImage`. During preview and PDF generation this image is provided to the selected cover template.

## Image Proxy

When adding external images, the app routes the request through `/api/image-proxy`.
This server-side proxy fetches the image and returns it with permissive CORS headers
to prevent cross-origin errors when loading user-provided URLs.

## Category-Aware Report Editor

An experimental `CategoryAwareReportEditor` is available but disabled by default.
To enable it safely, ensure the following features are complete and at parity with
the legacy editor:

- Tabbed navigation
- Template support
- Image annotation workflow
- AI assistance

Once these are implemented, set `ENABLE_CATEGORY_REPORT_EDITOR` to `true` in
`src/constants/featureFlags.ts` to turn on the new editor.

## Expense Tracking & CSV Export

Use the Expenses page to record business purchases, organize them by category, and download your records for accounting or tax filing.

### Best practices

- Create clear, consistent categories such as Supplies, Marketing, and Travel.
- Keep personal and business expenses separate to avoid commingling.
- Export a CSV report at least monthly and share it with your accountant.
- Retain receipts and notes to support deductions during tax preparation.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/069944d1-052a-41dd-b482-c41df0da3591) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Troubleshooting

### Google Maps features blocked

Route optimization and address autocomplete rely on the Google Maps API. If these
features aren't working, ad blockers or privacy extensions may be blocking
requests to `maps.googleapis.com`. Whitelist this domain or disable the blocking
extension to restore full functionality.

## Support Article Embeddings

The `support_articles` table stores documentation content and an embedding vector for semantic search. To generate embeddings from existing documentation pages and populate this table, run:

```sh
# Required environment variables: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npx ts-node scripts/embed-support-articles.ts
```

The script scans `src/pages` for files containing the term "documentation", creates embeddings using OpenAI's `text-embedding-3-small` model, and inserts the results into Supabase.
