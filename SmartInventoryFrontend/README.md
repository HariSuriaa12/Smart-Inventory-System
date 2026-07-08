# Smart Inventory Frontend

A modern React-based web application for inventory management with real-time stock tracking, purchase order management, and AI-powered demand forecasting.

**Stack:** React 18 | TypeScript | Vite | Redux Toolkit | Tailwind CSS | Axios

---

## 📋 Prerequisites

- Node.js 16+ (v18 recommended)
- npm or yarn
- Backend API running on `http://localhost:5000`

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd SmartInventoryFrontend
npm install
```

### 2. Setup Environment Variables

```bash
# Copy example env
cp .env.example .env.development

# Edit if needed (default points to localhost:5000)
# VITE_API_BASE_URL=http://localhost:5000
```

### 3. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable UI components (Button, Input, etc.)
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   └── forms/          # Form components
├── pages/              # Page components (routed pages)
├── services/           # API communication layer
├── store/              # Redux state management
│   ├── slices/        # Redux slices
│   └── hooks/         # Redux hooks
├── types/              # TypeScript interfaces
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── router/             # Routing configuration
└── context/            # React Context providers

```

---

## 🔑 Key Features Implemented

### ✅ Foundation Layer (100%)
- Complete TypeScript type definitions for all entities
- API service layer with axios interceptors
- Redux Toolkit store with 14 slices
- Custom hooks (useAuth, useForm, usePagination, etc.)
- Utility functions (formatters, validators, error handling)

### ✅ UI Components (60%)
- Button (variants, sizes, loading states)
- Input (with validation, error handling)
- Select (dropdown with options)
- Modal (customizable sizes, footer)
- Card (container with title)
- Badge (status indicators)
- Alert (dismissible notifications)
- Spinner (loading indicator)

### ⏳ To Be Implemented
- Layout Components (Header, Sidebar, MainLayout)
- Authentication Pages (Login)
- Master Data Pages (Items, Locations, Vendors, Customers, Users)
- Inventory Management
- Purchase Orders
- Order Fulfillment
- Sales Management
- Stock Transfer
- Forecasting & Reports

---

## 🔐 Authentication

The application uses JWT-based authentication:

1. User logs in via LoginPage
2. Token stored in localStorage
3. All API requests automatically include Authorization header
4. Automatic redirect to login on 401 errors
5. Redux auth state persists across page refreshes

**Login Flow:**
```
LoginPage → authService.login() → dispatch(login thunk) → Save token & user → Redirect to dashboard
```

---

## 🎨 Styling

Uses **Tailwind CSS** for styling:

- **Color Scheme:** Primary (sky-blue), Secondary (purple), Semantic (green, red, yellow)
- **Components:** Classnames used for conditional styling
- **Responsive:** Mobile-first approach with Tailwind breakpoints
- **Dark Mode:** Ready to implement via theme state

---

## 🔄 State Management (Redux)

All state is managed through Redux with the following pattern:

```typescript
// In component
const dispatch = useAppDispatch()
const { items, loading } = useAppSelector(state => state.items)

// Dispatch action
useEffect(() => {
  dispatch(fetchItems({ skip: 0, take: 10 }))
}, [])
```

**Global State Slices:**
- auth (authentication state)
- items, locations, vendors, customers, users (master data)
- inventory, purchaseOrders, orderFulfillment, sales, stockTransfer, forecasting
- ui (loading, modals, notifications, theme)

---

## 📡 API Integration

All API calls are typed and handled through service layer:

```typescript
// Service call
const response = await itemService.getItems(skip, take)

// Error handling
.catch(error => handleApiError(error))

// Automatic retry on network errors
// Automatic logout on 401
```

**Base URL:** Configured in `.env` → Auto-prefixed to all requests

---

## 🎯 Common Tasks

### Create a New Page

1. Create file in `src/pages/[module]/`
2. Use Redux hooks to fetch data
3. Use components from `src/components/`
4. Add route in `src/router/routes.ts`

### Create a New API Service

1. Add methods to `src/services/[module]Service.ts`
2. Return typed API responses
3. Use in Redux thunk

### Create a Custom Component

1. Create in `src/components/`
2. Use Tailwind for styling
3. Export for reuse
4. Document props in JSDoc

### Add Form Validation

```typescript
const { values, errors, handleChange, handleSubmit } = useForm({
  initialValues: { name: '' },
  onSubmit: async (values) => { /* submit */ },
  validate: (values) => {
    const errors: Record<string, string> = {}
    if (!values.name) errors.name = 'Required'
    return errors
  },
})
```

---

## 🧪 Testing

Ready for integration with Jest + React Testing Library:

```bash
npm test
```

---

## 📚 Documentation

See additional docs:
- `FRONTEND_ARCHITECTURE.md` - Complete architecture & planning
- `GENERATION_SUMMARY.md` - Detailed generation report
- `PROGRESS.md` - Development progress tracker

---

## 🐛 Troubleshooting

### API Connection Error

```
Error: ECONNREFUSED 127.0.0.1:5000
```

**Solution:** Start backend API on port 5000 or update `VITE_API_BASE_URL`

### Port Already in Use

```
Port 3000 already in use
```

**Solution:**
```bash
# Use different port
npm run dev -- --port 3001
```

### Redux State Not Updating

- Check if dispatch is called
- Verify async thunk is returning data
- Check Redux DevTools for state changes

### Styling Issues

- Ensure Tailwind CSS is imported in `index.css`
- Clear node_modules and reinstall
- Verify `tailwind.config.ts` is correct

---

## 🔗 Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=Smart Inventory System
VITE_APP_VERSION=1.0.0
```

---

## 📦 Dependencies

### Core
- react@^18.2.0
- react-dom@^18.2.0
- react-router-dom@^6.20.0

### State Management
- @reduxjs/toolkit@^1.9.7
- react-redux@^8.1.3

### Styling
- tailwindcss@^3.3.6
- classnames@^2.3.2

### Utilities
- axios@^1.6.2
- date-fns@^2.30.0
- lucide-react@^0.294.0

### Development
- typescript@^5.2.2
- vite@^5.0.8
- @vitejs/plugin-react@^4.2.0

---

## 🚢 Deployment

### Netlify / Vercel

```bash
npm run build
# Deploy dist/ folder
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 📊 Performance

- Lazy loading for routes
- Code splitting via Vite
- Optimized re-renders with Redux
- Memoization ready with React.memo

---

## 🤝 Contributing

1. Create feature branch
2. Follow existing code style
3. Write TypeScript with full types
4. Test components before commit
5. Update documentation

---

## 📝 License

Proprietary - Smart Inventory System

---

## ✨ Next Steps

1. Implement Header & Sidebar layout components
2. Create LoginPage with form validation
3. Build master data pages (Items, Locations, etc.)
4. Add inventory management features
5. Implement purchase order workflow
6. Add real-time updates / WebSocket support
7. Create reporting dashboards
8. Add unit & integration tests

---

**Generated:** July 8, 2026  
**Status:** Framework Complete | Ready for Feature Development  
**Estimated Completion:** 46 hours remaining development

For detailed implementation guide, see `GENERATION_SUMMARY.md`
