# Renospace - AI Interior Design App

Transform your living spaces with AI-powered design tools. Renospace combines cutting-edge AI technology with intuitive design tools to help you reimagine your home.

## 🎨 Features

### Studio Tools
- **Color Touch**: Recolor walls, floors, and surfaces with magic select or manual paint
- **Object Swap**: Replace furniture and decor items with AI-generated alternatives
- **Room Render**: Transform entire rooms with style descriptions
- **Style Sync**: Merge design styles from reference photos
- **Garden Render**: Transform outdoor spaces and gardens
- **Surface Style**: Change surface materials and textures
- **Virtual Stager**: Add furniture to empty rooms
- **360° Tour**: Create immersive virtual tours
- **Art Preview**: Generate artwork for your walls

### Compose Flow
- **Room Type Selection**: Choose from living room, bedroom, kitchen, etc.
- **Style Preference**: Pick from 25+ design styles with visual cards
- **Color Scheme**: Custom color palettes or AI-suggested combinations
- **Custom Notes**: Add your specific preferences and requirements

### Gallery & Management
- **My Designs**: View all your generated designs in one place
- **Quick Edit**: Regenerate designs with different parameters
- **Design History**: Track your design journey and iterations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI
- iOS Simulator or Android Emulator
- Supabase account
- Replicate API key

### Installation

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd designai-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=your_revenuecat_key
   ```

4. **Set up Supabase**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Start Supabase locally
   supabase start
   
   # Deploy Edge Functions
   supabase functions deploy run-tool
   supabase functions deploy upload-image
   ```

5. **Configure Replicate API**
   - Get your API key from [Replicate](https://replicate.com)
   - Add to Supabase Environment Variables:
     - Key: `REPLICATE_API_TOKEN`
     - Value: `r8_your_token_here`

6. **Run the app**
   ```bash
   npx expo start
   ```

## 🏗️ Architecture

### Frontend
- **React Native** with Expo Router
- **TypeScript** for type safety
- **NativeWind** for styling
- **Supabase** for backend services

### Backend
- **Supabase Edge Functions** for AI processing
- **FLUX Kontext Pro** for image editing
- **Supabase Storage** for image management
- **PostgreSQL** for user data and design history

### AI Integration
- **FLUX Kontext Pro**: High-quality image editing and recoloring
- **FLUX Schnell**: Fast previews and iterations
- **Custom prompts**: Tailored for interior design use cases

## 🎯 Key Features Explained

### Color Touch Magic Select
- Uses FLUX Kontext Pro for precise wall recoloring
- Preserves furniture, lighting, and textures
- Supports both automatic and manual selection modes

### Style Transfer
- 25+ curated design styles (Art Deco, Mid-Century, Scandinavian, etc.)
- Visual style cards for easy selection
- AI-powered style merging and adaptation

### Image Processing Pipeline
1. **Upload**: Secure image upload to Supabase Storage
2. **Processing**: FLUX API handles AI transformations
3. **Storage**: Results saved with metadata
4. **Gallery**: Organized display of all designs

## 🔧 Development

### Project Structure
```
designai-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Main app tabs
│   │   ├── studio/        # Design tools
│   │   ├── compose/       # Design flow
│   │   └── me/           # User gallery
│   ├── onboarding.tsx    # User onboarding
│   └── splash.tsx        # App splash screen
├── components/            # Reusable UI components
├── contexts/             # React contexts
├── supabase/             # Backend functions
│   └── functions/        # Edge functions
├── utils/                # Utility functions
└── assets/               # Images and styles
```

### Adding New Tools
1. Create new component in `app/(tabs)/studio/`
2. Add to studio navigation
3. Implement upload and AI processing
4. Add to database schema if needed

### Environment Setup
- **Development**: Local Supabase instance
- **Production**: Supabase cloud with proper RLS policies
- **Testing**: Expo Go app for quick iterations

## 🚀 Deployment

### iOS App Store
1. Configure app.json with proper bundle ID
2. Set up certificates and provisioning profiles
3. Build with EAS: `eas build --platform ios`
4. Submit to App Store Connect

### Android Play Store
1. Configure app.json with package name
2. Generate signed APK: `eas build --platform android`
3. Upload to Google Play Console

## 📱 User Flow

1. **Onboarding**: Welcome → Style preferences → Room type
2. **Main App**: Studio tools, Compose flow, Gallery
3. **Design Process**: Upload → AI processing → Results
4. **Gallery**: View, edit, and manage designs

## 🔒 Security

- **RLS Policies**: Row-level security on all database tables
- **API Keys**: Secure storage in environment variables
- **User Authentication**: Supabase Auth integration
- **File Upload**: Secure storage with access controls

## 🛠️ Troubleshooting

### Common Issues

**Image Upload Fails**
- Check Supabase Storage bucket permissions
- Verify environment variables are set
- Ensure image file is not corrupted

**AI Processing Errors**
- Verify Replicate API token is valid
- Check Edge Function logs in Supabase dashboard
- Ensure image format is supported (JPEG, PNG)

**App Won't Build**
- Clear cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Expo SDK version compatibility

## 📄 License

[Your License Here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review Supabase and Expo documentation

---

**Built with ❤️ using React Native, Expo, Supabase, and FLUX AI**
