# Tampa Blog Manager

A web-based blog management dashboard that syncs with your Webflow CMS collection. Manage blog posts without accessing the Webflow backend.

## Features

- **Password Protected**: Simple password authentication
- **View All Posts**: See all blog posts with status (draft/published)
- **Create Posts**: Add new blog posts with rich text editor
- **Edit Posts**: Update existing posts
- **Publish/Unpublish**: Control post visibility
- **Delete Posts**: Remove posts from the CMS
- **Reference Fields**: Select Location and Category from dropdowns
- **Image Uploads**: Upload main image, thumbnail, and author photo

## Quick Start

### 1. Install Dependencies

```bash
cd webflow-blog-manager
npm install
```

### 2. Configure Environment

The `.env.local` file is already created with your credentials. **Important**: Change the password before deploying!

Edit `.env.local`:
```env
# Change this password!
ADMIN_PASSWORD=your-secure-password-here

# Change this secret!
SESSION_SECRET=your-random-secret-key
```

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 4. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

**Important**: Set environment variables in Vercel dashboard:
- `WEBFLOW_API_KEY`
- `BLOG_COLLECTION_ID`
- `LOCATIONS_COLLECTION_ID`
- `CATEGORIES_COLLECTION_ID`
- `ADMIN_PASSWORD` (use a strong password!)
- `SESSION_SECRET` (random string)
- `IMGBB_API_KEY` (for image uploads - get free key at https://api.imgbb.com/)

## Usage

1. Go to your deployed URL (or localhost:3000)
2. Enter the password (default: `blogadmin123`)
3. View, create, edit, or delete blog posts
4. Click "Publish" to make a draft post live

## Image Upload Setup

Images are uploaded to a hosting service (ImgBB or Cloudinary) and the URL is saved to Webflow.

### Option 1: ImgBB (Recommended - Free)
1. Go to https://api.imgbb.com/
2. Sign up and get your free API key
3. Add to `.env.local`: `IMGBB_API_KEY=your-key-here`

### Option 2: Cloudinary
1. Sign up at https://cloudinary.com/
2. Create an unsigned upload preset in Settings > Upload
3. Add to `.env.local`:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_UPLOAD_PRESET=your-preset-name
   ```

## Limitations

- **Next/Previous Post references**: Not editable (self-referential)

## File Structure

```
webflow-blog-manager/
├── app/
│   ├── api/
│   │   ├── auth/          # Login/logout endpoints
│   │   ├── posts/         # CRUD for blog posts
│   │   ├── upload/        # Image upload endpoint
│   │   ├── locations/     # Fetch locations for dropdown
│   │   └── categories/    # Fetch categories for dropdown
│   ├── posts/
│   │   ├── new/          # New post page
│   │   └── [id]/         # Edit post page
│   ├── layout.js
│   ├── page.js           # Main dashboard
│   └── globals.css
├── components/
│   ├── LoginForm.js
│   ├── PostsList.js
│   ├── PostEditor.js
│   ├── RichTextEditor.js
│   └── ImageUpload.js
├── lib/
│   ├── auth.js           # Authentication helpers
│   └── webflow.js        # Webflow API client
├── .env.local            # Environment variables
└── package.json
```

## Security Notes

1. **Change the default password** before deploying
2. **Keep `.env.local` secret** - never commit it to git
3. Consider adding IP restrictions or additional auth for production

## Webflow Collection Schema

The tool is configured for the Tampa Blog Posts collection with these fields:
- Name (required)
- Slug (required)
- Post Summary
- Post Body (Rich Text)
- Author Name
- Alt Text
- Featured (boolean)
- Location (reference)
- Category (reference)
- Main Image
- Thumbnail Image
- Author Image
