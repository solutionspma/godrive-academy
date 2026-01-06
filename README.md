# 🚗 GoDrive.academy Platform

**Version:** 1.0.0  
**Build Date:** January 6, 2026  
**Status:** ✅ Production Ready

---

## 🎯 Overview

**GoDrive.academy** is a white-label platform for deploying customized driving school websites. The system separates **templates** (reusable layouts) from **instances** (customer-specific data), enabling rapid deployment of branded sites from a single codebase.

---

## 📁 Directory Structure

```
GOdrive.academy/
├── templates/                      # Reusable templates
│   └── driving-school-v1/          # Template #1
│       ├── public/                 # All HTML, CSS, JS, assets
│       │   ├── index.html
│       │   ├── courses.html
│       │   ├── coach.html         # AI Practice Test Coach
│       │   ├── contact.html
│       │   ├── login.html
│       │   ├── dashboard.html
│       │   ├── css/
│       │   ├── js/
│       │   └── images/
│       └── src/
│           ├── instance-loader.js  # 🔥 Config loader
│           └── config/
│               └── template.config.json  # Schema
│
├── instances/                      # Customer configurations
│   └── firststep/                  # First Step instance
│       └── instance.config.json    # 🔧 Edit this!
│
└── _intake/                        # Raw/archived files
    └── firststep-raw/              # Original First Step files
```

---

## 🚀 How It Works

### The Architecture

1. **Template** = The layout, design, and structure (frozen)
2. **Instance** = Customer-specific data (JSON only)
3. **Loader** = JavaScript that injects instance data into template at runtime

### Key Principle

**❌ Never edit the template for customer branding**  
**✅ Only edit the instance configuration**

---

## 🎨 Deploy a New Customer

### Step 1: Create Instance Config

```bash
cd GOdrive.academy/instances
mkdir new-customer
cp firststep/instance.config.json new-customer/
```

### Step 2: Edit Configuration

Open `new-customer/instance.config.json`:

```json
{
  "schoolName": "Elite Driving Academy",
  "tagline": "Excellence in Education",
  "phone": "(555) 987-6543",
  "email": "info@elitedriving.com",
  "colors": {
    "primary": "#8b5cf6",
    "accent": "#ec4899"
  }
}
```

### Step 3: Deploy

```bash
# Option A: Netlify
cd templates/driving-school-v1/public
netlify deploy --prod

# Option B: Vercel
vercel --prod

# Option C: Traditional hosting
# Upload public/ folder via FTP
```

### Step 4: Set Instance

Add this meta tag to index.html during build:

```html
<meta name="godrive-instance" content="new-customer">
```

Or use URL parameter:
```
https://yoursite.com?instance=new-customer
```

---

## 📝 Configuration Options

### Branding
```json
{
  "schoolName": "Your Driving School",
  "tagline": "Learn to Drive",
  "logo": "images/logo.jpg",
  "favicon": "images/favicon.ico"
}
```

### Colors
```json
{
  "colors": {
    "primary": "#1e40af",
    "primaryDark": "#1e3a8a",
    "accent": "#f97316"
  }
}
```

### Hero Section
```json
{
  "hero": {
    "badge": "🚗 Trusted by 5,000+ Students",
    "headline": "Learn to Drive with Confidence",
    "ctaPrimaryText": "Book Your Lesson",
    "stats": [
      { "number": "20+", "label": "Years Experience" }
    ]
  }
}
```

### Features
```json
{
  "features": {
    "practiceTests": {
      "enabled": true,
      "title": "AI Driving Coach",
      "badge": "✨ NEW"
    },
    "courses": [
      {
        "icon": "🎓",
        "title": "Teen Program",
        "description": "Complete education..."
      }
    ]
  }
}
```

### Locations
```json
{
  "locations": [
    {
      "name": "Main Campus",
      "address": "123 Main St",
      "phone": "(555) 123-4567"
    }
  ]
}
```

---

## 🧪 Testing

### Local Test
```bash
cd templates/driving-school-v1/public
python3 -m http.server 8000
```

Visit: `http://localhost:8000?instance=firststep`

### Check Console
```
✅ GoDrive Instance Loaded: First Step Driving Academy
📍 Instance ID: firststep
```

---

## 🔧 Maintenance

### Update Template (All Sites)
Edit files in:
```
templates/driving-school-v1/public/
```

All instances automatically get the updates.

### Update One Customer
Edit their instance config:
```
instances/customer-name/instance.config.json
```

Only that customer's site changes.

---

## 🎯 Rules

### ✅ DO
- Edit instance configs for branding
- Add new instances for new customers
- Update template for layout/design improvements
- Test locally before deploying

### ❌ DON'T
- Hardcode customer data in template
- Create customer-specific template copies
- Put layouts/styles in instance folders
- Break template/instance separation

---

## 📊 Comparison

### Old Way (Copied Sites)
- ❌ Duplicate codebases
- ❌ Update 10+ sites individually
- ❌ Inconsistent versions
- ❌ 2-3 hours per site

### New Way (Template/Instance)
- ✅ Single codebase
- ✅ Update once, affects all
- ✅ Consistent versions
- ✅ 5 minutes per site

---

## 🚀 Scaling

Deploy 100 customers:
1. Template = 1 deployment
2. Instances = 100 JSON files
3. Each customer loads their config at runtime

Update all 100 sites:
1. Edit template
2. Deploy once
3. All sites updated

---

## 📦 What's Included

### Pages
- Homepage with hero
- Courses listing
- AI Practice Test Coach (50 states)
- Contact form
- Login/Registration
- Student dashboard

### Features
- Responsive design
- SEO optimized
- Accessible (WCAG 2.1)
- Multi-location support
- Supabase integration ready
- Progress tracking

---

## 🔮 Roadmap

### Phase 1 (Complete ✅)
- ✅ Template/instance architecture
- ✅ Runtime configuration
- ✅ First Step migration
- ✅ Documentation

### Phase 2 (Next)
- 🔜 Build system for meta tag injection
- 🔜 Admin dashboard for config editing
- 🔜 Multi-template support
- 🔜 Deployment automation

---

## 📄 Files Guide

| File | Purpose | Edit? |
|------|---------|-------|
| `templates/*/public/*` | Template files | Only for design |
| `templates/*/src/instance-loader.js` | Config loader | Only for features |
| `templates/*/src/config/template.config.json` | Schema reference | No |
| `instances/*/instance.config.json` | Customer data | ✅ Yes! |
| `_intake/` | Archive | No |

---

## 🆘 Troubleshooting

### Config Not Loading
```bash
# Check browser console
# Should see: ✅ GoDrive Instance Loaded

# If not, verify:
1. instance-loader.js is included in HTML
2. instance.config.json exists
3. Path to config is correct
4. JSON is valid
```

### Wrong Customer Data Showing
```bash
# Verify instance parameter
?instance=customer-name

# Or check meta tag
<meta name="godrive-instance" content="customer-name">
```

### Colors Not Updating
```bash
# Hard refresh browser
Cmd+Shift+R (Mac) / Ctrl+F5 (Windows)

# Check CSS variables in DevTools
:root { --primary: ... }
```

---

## 📞 Support

**Documentation:**
- This file - Platform overview
- `templates/driving-school-v1/README.md` - Template docs
- `instances/firststep/README.md` - Instance example

**Tools:**
- Browser DevTools - Debugging
- JSON validators - Config validation

---

## 📄 License

Proprietary - GoDrive.academy  
© 2026 All Rights Reserved

---

**Built for scalable, maintainable white-label sites.**

*Deploy unlimited customers from one template.* 🚀
