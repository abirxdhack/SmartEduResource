<div align="center">

# Smart Educational Resource

**Knowledge, Organized. Learning, Unlimited.**

A fast, free digital library for study PDFs. Post a Google Drive link, and learners can read, download and share it instantly.

![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?style=for-the-badge&logo=php&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No Database](https://img.shields.io/badge/Database-None-success?style=for-the-badge)

</div>

---

## Features

- **Google Drive powered**: PDFs are never stored on your server. Reading and downloading come straight from Google, so it stays fast and light on any host.
- **Book showcase**: an auto-changing spotlight plus an endlessly running book rail with live search. Every book can be read, downloaded or shared right from it.
- **Instant reader**: opens Google's viewer immediately, with an optional in-page Smart reader.
- **Powerful library**: search, filter by class, subject, board, year and type, sort, and paginate.
- **Share-ready**: every book gets its own link with a cover preview for WhatsApp and Facebook.
- **Admin panel**: add, edit, publish, feature and delete resources. Check Drive links, pick thumbnails, manage categories and read messages.
- **Light, Dark and System themes**, fully responsive from small phones to large desktops.
- **No database**: plain files only, so setup takes minutes.

## Requirements

- Any PHP 8.0 or newer hosting (serv00, shared hosting, VPS)
- Apache with `.htaccess` support
- A Google account for Google Drive

## Quick Setup

### 1. Upload the files

Unzip the project and upload **everything** (including the hidden `.htaccess`) into your site's `public_html` folder using the File Manager or FTP.

> On serv00 the folder is `/usr/home/YOUR_USER/domains/YOUR_DOMAIN/public_html`.

### 2. Choose PHP 8

In your hosting panel open **Websites â†’ your site â†’ PHP** and set the default version to PHP 8.x.

### 3. Check folder permissions

These four folders must be writable (permission `755`): `data`, `storage`, `covers` and `r`.

### 4. Log in

Open `https://YOUR_DOMAIN/login`, sign in as `username` with your admin password, and look for **Server ready** on the dashboard.

### 5. Change the admin password

Create a new hash on any computer:

```bash
echo -n "username:YourNewPassword" | sha256sum
```

Paste the result into `ADMIN_HASH` near the top of `api.php`, then save the file.

### 6. Update your domain

Open `robots.txt` and replace the domain in the `Sitemap:` line with your own.

## Post Your First PDF

1. Upload the PDF to **Google Drive**.
2. Right-click it, choose **Share**, set General access to **Anyone with the link** (Viewer), then **Copy link**.
3. In the admin panel click **Add PDF** and paste the link.
4. Press **Check link**. It confirms the file is public and fills in the title and size.
5. Choose a thumbnail:

| Option | What it does |
|---|---|
| **Auto** | Uses the first page of your PDF |
| **Drive image** | Uses a public image link from Google Drive |
| **Image URL** | Uses any `https://` image address |
| **Upload photo** | Uploads a photo from your device (shrunk automatically) |
| **None** | Shows a coloured generated cover |

6. Fill in class, subject, board and year, then press **Publish now**. It appears on the homepage immediately.

## Optional: Smart Reader

For an in-page reader with zoom and page jump:

1. Open Google Cloud Console and enable **Google Drive API**.
2. Go to **Credentials**, create an **API key**, and restrict it to the Drive API and your website address.
3. In the admin panel open **Categories & lists â†’ Site settings** and paste the key.

A **Smart reader** tab then appears in the reader. The Google viewer stays the default.

## Customize

| What | Where |
|---|---|
| Dev Info, footer, social links | `assets/js/common.js` |
| Colors, fonts, spacing | top of `assets/css/app.css` |
| Homepage sections | `index.html` and `assets/js/app.js` |
| Showcase speed | `MS` and `SPEED` at the top of `assets/js/showcase.js` |

After editing any CSS or JS file, change `?v=4` to `?v=5` in the HTML files so visitors get the new version.

## Project Structure

```text
.
â”œâ”€â”€ index.html          Homepage
â”œâ”€â”€ read.html           PDF reader
â”œâ”€â”€ about.html  contact.html  privacy.html  terms.html  404.html
â”œâ”€â”€ api.php             Backend (one small file)
â”œâ”€â”€ admin/  login/      Admin panel and login
â”œâ”€â”€ assets/             css, js, images, icons
â”œâ”€â”€ data/               Public library data (auto-generated)
â”œâ”€â”€ covers/             Uploaded thumbnails
â”œâ”€â”€ r/                  Share pages with previews (auto-generated)
â””â”€â”€ storage/            Private database. Back this up and never delete it.
```

## Troubleshooting

| Problem | Fix |
|---|---|
| Dashboard says not responding | Make sure `api.php` is in the site root and PHP is enabled |
| "Not writable" warning | Set `data`, `storage`, `covers` and `r` to permission `755` |
| Drive shows "Request access" | Set the file's sharing to **Anyone with the link** |
| Changes do not show | Press **Ctrl + F5**, or bump the `?v=` number |
| Link preview is outdated on WhatsApp or Facebook | Re-scrape the link with the Facebook Sharing Debugger |

## Backup

Back up the `storage/` folder regularly. It holds all your posts, settings and messages.

## Credits

Built with care by **Abir Arafat Chawdhury**.

- Copyright: @abirxdhack
- GitHub: https://github.com/abirxdhack
- Repository: https://github.com/abirxdhack/SmartEduResource