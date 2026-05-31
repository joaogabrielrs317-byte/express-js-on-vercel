import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'

import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

import HomePage from './pages/HomePage'
import PostPage from './pages/PostPage'
import CategoryPage from './pages/CategoryPage'
import EntrevistasPage from './pages/EntrevistasPage'
import AboutPage from './pages/AboutPage'
import ClippingPage from './pages/ClippingPage'
import ContactPage from './pages/ContactPage'
import PressKitPage from './pages/PressKitPage'
import SearchPage from './pages/SearchPage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminPosts from './pages/AdminPosts'
import AdminPostEditor from './pages/AdminPostEditor'
import AdminCategories from './pages/AdminCategories'
import AdminNewsletter from './pages/AdminNewsletter'
import AdminProfile from './pages/AdminProfile'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/artigos/:slug" element={<PostPage />} />
                <Route path="/entrevistas" element={<EntrevistasPage />} />
                <Route path="/categorias/:slug" element={<CategoryPage />} />
                <Route path="/sobre" element={<AboutPage />} />
                <Route path="/clipping" element={<ClippingPage />} />
                <Route path="/contato" element={<ContactPage />} />
                <Route path="/press-kit" element={<PressKitPage />} />
                <Route path="/busca" element={<SearchPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Auth */}
              <Route path="/admin/login" element={<LoginPage />} />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="artigos" element={<AdminPosts />} />
                <Route path="artigos/novo" element={<AdminPostEditor />} />
                <Route path="artigos/:id" element={<AdminPostEditor />} />
                <Route path="perfil" element={<AdminProfile />} />
                <Route path="categorias" element={<AdminCategories />} />
                <Route path="newsletter" element={<AdminNewsletter />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
