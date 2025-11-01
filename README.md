# Mall Management Dashboard

A modern React + Vite application for managing malls and shops with role-based access control and secure JWT authentication.

## 🚀 Features

- **Role-Based Authentication**: Support for Super Admin, Mall Admin, and Shop Admin roles
- **JWT Token Management**: Secure token generation and validation
- **Dynamic Dashboard**: Role-specific data filtering and UI
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with TailwindCSS
- **Multi-Mall Theming**: Configurable branding for different mall locations
- **Real-time Data**: Integration with n8n webhook APIs

## 🏗️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Authentication**: JWT (jsonwebtoken)
- **State Management**: React Context API
- **Routing**: React Router (for future expansion)

## 📋 User Roles & Permissions

### Super Admin (Bosco)
- **Access**: All malls and shops
- **Permissions**: Full system access
- **Demo Credentials**: `username: bosco`, `password: demo123`

### Mall Admin (Jane, Faith, Ngina)
- **Access**: Only their assigned mall
- **Permissions**: Manage shops within assigned mall
- **Demo Credentials**: 
  - Jane: `username: jane`, `password: demo123` (China Square Mall)
  - Faith: `username: faith`, `password: demo123` (Langata Mall)
  - Ngina: `username: ngina`, `password: demo123` (NHC Mall)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and navigate to the project directory**
   ```bash
   cd mall-management-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   - Navigate to `http://localhost:3000`
   - Use demo credentials to test different user roles

### Build for Production

```bash
npm run build
```

The build files will be generated in the `dist` directory.

## 🔧 Configuration

### API Configuration
Update the API base URL in `src/services/auth.ts`:
```typescript
private static readonly API_BASE_URL = 'https://n8n.tenear.com/webhook/management/malls';
```

### JWT Secret
Update the JWT secret in `src/services/auth.ts`:
```typescript
const JWT_SECRET = 'your-production-secret-key';
```

### Theme Customization
Modify the theme configuration in `src/types/auth.ts`:
```typescript
export const MALL_THEMES: Record<string, MallTheme> = {
  chinaSquare: {
    name: 'China Square Mall',
    primaryColor: '#722ED1',
    // ... other theme properties
  }
};
```

## 🧪 Testing Different Roles

1. **Login with different accounts** using the demo credentials
2. **Observe role-based filtering**: 
   - Super Admin sees all 3 malls
   - Mall Admin sees only their assigned mall
3. **Test responsive design** on different screen sizes
4. **Verify authentication flow** including logout and session recovery

## 📁 Project Structure

```
mall-management-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── LoginForm.tsx   # Authentication form
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── MallCard.tsx    # Mall display card
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── services/           # API and authentication services
│   │   └── auth.ts         # Auth and API services
│   ├── types/              # TypeScript type definitions
│   │   └── auth.ts         # Auth and data types
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles and Tailwind imports
├── public/                 # Static assets
├── package.json            # Project dependencies
├── tailwind.config.js      # TailwindCSS configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 🎨 Design System

### Color Palette
- **Page Background**: `#F8F9FA` (Subtle off-white)
- **Surface Background**: `#FFFFFF` (Pure white for cards)
- **Primary Accent**: `#1890FF` (Configurable per mall)
- **Text Primary**: `#212529` (High contrast for readability)
- **Text Secondary**: `#6C757D` (Muted for descriptions)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold weights for clear hierarchy
- **Body Text**: Optimized for screen readability

### Component Design
- **Cards**: Subtle shadows with hover animations
- **Buttons**: Consistent sizing with hover effects
- **Inputs**: Focused states with subtle border highlighting
- **Tags**: Role-based color coding

## 🔒 Security Features

- **JWT Token Validation**: Secure token verification
- **Role-Based Access Control**: Enforced at component level
- **Session Management**: Automatic token expiration handling
- **Protected Routes**: Authentication required for all protected content
- **Error Handling**: Graceful handling of authentication failures

## 🚀 Future Enhancements

- **Shop Management Interface**: Detailed shop management features
- **Analytics Dashboard**: Charts and reporting
- **User Management**: Admin tools for managing users
- **Theme Manager**: Visual theme customization
- **Real-time Updates**: WebSocket integration for live data
- **Mobile App**: React Native version

## 📝 License

This project is for demonstration purposes. In production, ensure proper security audits and compliance with your organization's requirements.

---

Built with ❤️ using React + Vite + TailwindCSS