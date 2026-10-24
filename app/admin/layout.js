// All admin routes share one clear local-editor entry gate. This is not server authentication:
// GitHub Pages is static, so private/admin data must live behind a real backend to be secure.
import AdminLoginGate from './AdminLoginGate';
export const metadata = { title: 'Admin workspace', robots: { index: false, follow: false } };
export default function AdminLayout({ children }) {
  return <AdminLoginGate>{children}</AdminLoginGate>;
}
