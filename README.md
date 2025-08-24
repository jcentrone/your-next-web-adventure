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

## Managing Cover Pages

The app supports fully customizable cover pages for reports.

### Creating a cover page

1. From the header, open **Cover Page Manager** or visit `/cover-page-manager`.
2. Click **New Cover Page**.
3. Enter a name and choose a **Template** (Default or Modern).
4. Pick a color, add optional text and an image URL.
5. Select the report types this cover page should apply to.
6. Save to create the cover page.

### Editing and assigning

* On the Cover Page Manager page, click **Edit** next to any cover page to change its
  template, color palette, text, image, or assigned report types.
* Use the **Report Type Assignments** section to set the default cover page for
  **Home Inspection** or **Wind Mitigation** reports.
* When creating a new report, you can also choose a cover page from the **Cover Page**
  dropdown.

### Generating PDFs with a cover page

After a cover page is assigned, generate a report PDF from the report preview. The
selected cover page will appear at the beginning of the PDF.

## Image Proxy

When adding external images, the app routes the request through `/api/image-proxy`.
This server-side proxy fetches the image and returns it with permissive CORS headers
to prevent cross-origin errors when loading user-provided URLs.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/069944d1-052a-41dd-b482-c41df0da3591) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
