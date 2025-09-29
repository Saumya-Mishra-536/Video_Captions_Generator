# 🚀 Deployment Guide: Hinglish Captioning Demo

Deploy your Hinglish Captioning Demo to **Render** (backend) and **Vercel** (frontend).

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Vercel account (free tier available)
- Deepgram API key
- OpenRouter API key

## 🏗️ Architecture

```
Frontend (Vercel) ←→ Backend (Render) ←→ Transliteration Service (Render)
                           ↓
                    Deepgram API
```

## 📦 Step 1: Prepare Repository

### 1.1 Initialize Git (if not already done)
```bash
cd captioning-demo
git init
git add .
git commit -m "Initial commit: Hinglish Captioning Demo"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `hinglish-captioning-demo`
3. Make it public (for free Render deployment)
4. Don't initialize with README (we already have files)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/hinglish-captioning-demo.git
git branch -M main
git push -u origin main
```

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub account

### 2.2 Deploy Main Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `hinglish-captioning-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   TRANSLITERATION_SERVICE_URL=https://hinglish-transliteration.onrender.com/transliterate
   FRONTEND_ORIGIN=https://your-vercel-app.vercel.app
   ```

5. Click "Create Web Service"

### 2.3 Deploy Transliteration Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `hinglish-transliteration`
   - **Root Directory**: `server/transliteration_service`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python start_service.py`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

5. Click "Create Web Service"

### 2.4 Update Backend Service
After both services are deployed, update the backend service:
1. Go to your backend service settings
2. Update `TRANSLITERATION_SERVICE_URL` to your transliteration service URL
3. Update `FRONTEND_ORIGIN` to your Vercel URL (after deploying frontend)

## ⚛️ Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Connect your GitHub account

### 3.2 Deploy Frontend
1. Click "New Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. Add Environment Variables:
   ```
   REACT_APP_API_BASE=https://hinglish-captioning-backend.onrender.com
   ```

5. Click "Deploy"

## 🔧 Step 4: Configure Services

### 4.1 Update Backend CORS
After Vercel deployment, update your backend service:
1. Go to Render dashboard
2. Select your backend service
3. Go to Environment tab
4. Update `FRONTEND_ORIGIN` to your Vercel URL
5. Redeploy the service

### 4.2 Test the Application
1. Open your Vercel URL
2. Upload a test video
3. Check if captions are generated
4. Verify Hinglish transliteration works

## 🌐 Step 5: Custom Domain (Optional)

### 5.1 Vercel Custom Domain
1. Go to your Vercel project settings
2. Add your custom domain
3. Update DNS records as instructed

### 5.2 Render Custom Domain
1. Go to your Render service settings
2. Add your custom domain
3. Update DNS records as instructed

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Check `FRONTEND_ORIGIN` in backend environment variables
   - Ensure it matches your Vercel URL exactly

2. **Transliteration Service Not Working**:
   - Check if transliteration service is running
   - Verify `TRANSLITERATION_SERVICE_URL` is correct
   - Check OpenRouter API key

3. **Deepgram API Errors**:
   - Verify `DEEPGRAM_API_KEY` is set correctly
   - Check if API key has sufficient credits

4. **Build Failures**:
   - Check if all dependencies are in package.json
   - Verify build commands are correct
   - Check logs for specific errors

### Debug Commands:

```bash
# Check backend logs
# Go to Render dashboard → Your service → Logs

# Check frontend build
cd app
npm run build

# Test locally
npm start
```

## 📊 Monitoring

### Render Monitoring:
- Go to your service dashboard
- Check "Metrics" tab for performance
- Monitor "Logs" for errors

### Vercel Monitoring:
- Go to your project dashboard
- Check "Functions" tab for API calls
- Monitor "Analytics" for usage

## 🔄 Updates and Maintenance

### Updating the Application:
1. Make changes to your code
2. Commit and push to GitHub
3. Render and Vercel will auto-deploy
4. Test the updated application

### Environment Variables:
- Update in Render dashboard for backend
- Update in Vercel dashboard for frontend
- Redeploy services after changes

## 💰 Cost Estimation

### Free Tier Limits:
- **Render**: 750 hours/month (free tier)
- **Vercel**: 100GB bandwidth/month (free tier)
- **Deepgram**: Pay-per-use (check pricing)
- **OpenRouter**: Free tier available

### Expected Monthly Cost:
- **Render**: $0 (free tier)
- **Vercel**: $0 (free tier)
- **Deepgram**: ~$5-20 (depending on usage)
- **OpenRouter**: $0-10 (depending on usage)

**Total**: ~$5-30/month for moderate usage

## 🎉 Success!

Your Hinglish Captioning Demo is now live! 

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Transliteration**: https://your-transliteration.onrender.com

## 📞 Support

If you encounter issues:
1. Check the logs in Render/Vercel dashboards
2. Verify all environment variables are set
3. Test the services individually
4. Check API key limits and credits
