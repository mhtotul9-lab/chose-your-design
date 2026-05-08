# StyleVote — Setup Guide

## ❗ সমস্যা: Blank Screen দেখাচ্ছে?
মানে Firebase env variables Vercel-এ add করা হয়নি।

---

## ✅ ধাপে ধাপে Fix করুন

### ধাপ ১: Firebase Project থেকে Config কপি করুন

1. https://console.firebase.google.com → আপনার project এ যান
2. বাম দিকে **Project Settings** (⚙️ gear icon) → **General** tab
3. নিচে **"Your apps"** section → Web app → **Config** বাটন
4. এই মতো একটা object দেখবেন:
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",           ← এটা REACT_APP_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",  ← REACT_APP_FIREBASE_AUTH_DOMAIN
  projectId: "xxx",              ← REACT_APP_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com",   ← REACT_APP_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456",   ← REACT_APP_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"         ← REACT_APP_FIREBASE_APP_ID
};
```

### ধাপ ২: Vercel এ Environment Variables Add করুন

1. https://vercel.com → আপনার project এ যান
2. উপরে **Settings** tab → বাম দিকে **Environment Variables**
3. নিচের প্রতিটি variable add করুন:

| Key | Value |
|-----|-------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase config থেকে `apiKey` এর value |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `authDomain` এর value |
| `REACT_APP_FIREBASE_PROJECT_ID` | `projectId` এর value |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `storageBucket` এর value |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` এর value |
| `REACT_APP_FIREBASE_APP_ID` | `appId` এর value |
| `REACT_APP_ADMIN_PASSWORD` | আপনার পছন্দের password (যেমন: mypass123) |

4. প্রতিটির জন্য Environment: **Production, Preview, Development** তিনটাই টিক দিন
5. **Save** করুন

### ধাপ ৩: Redeploy করুন

1. Vercel → আপনার project → **Deployments** tab
2. সর্বশেষ deployment এর পাশে **"..."** → **Redeploy**
3. ২-৩ মিনিট অপেক্ষা করুন → সাইট ঠিক হয়ে যাবে ✅

---

## 🔑 Admin Panel Access
- URL: `https://your-site.vercel.app?admin=1`
- Password: Vercel এ `REACT_APP_ADMIN_PASSWORD` যা দিয়েছেন

## 📌 Admin এ প্রথম কাজ
1. Admin login করুন
2. **System Toggle** → ON করুন (তাহলেই user রা সাইটে প্রবেশ করতে পারবে)

---

## 🆓 সম্পূর্ণ Free Plan এ কাজ করবে
- Firebase Firestore: Free (50k reads/day, 20k writes/day)
- Firebase Storage: লাগবে না (image URL ব্যবহার করা হয়)
- Vercel: Free

## 💡 Image URL কোথা থেকে পাবেন (Free)
- **Unsplash**: https://unsplash.com → কোনো ছবিতে Right click → Copy image address
- **Imgur**: https://imgur.com → Upload → Direct link কপি করুন
- **Google Drive**: ছবি upload → Share → "Anyone with the link" → লিঙ্ক কপি
  - তারপর লিঙ্ক এভাবে বদলান:
  - `https://drive.google.com/file/d/FILE_ID/view` → `https://drive.google.com/uc?id=FILE_ID`
