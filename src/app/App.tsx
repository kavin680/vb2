import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../features/layout/MainLayout";
import { LoginScreen } from "../features/auth/components/LoginScreen";
import { RegisterScreen } from "../features/auth/components/RegisterScreen";
import { RequireAuth } from "../features/auth/components/RequireAuth";
import { SettingsLayout } from "../features/settings/SettingsLayout";
import { ProfilePage } from "../features/settings/pages/ProfilePage";
import { UserManagementPage } from "../features/settings/pages/UserManagementPage";
import { SchedulesPage } from "../features/settings/pages/SchedulesPage";
import { ROUTES } from "../shared/constants/routes";

import { ServerHealthCheck } from "../lib/ServerHealthCheck";

function App() {
  return (
    <BrowserRouter>
      <ServerHealthCheck>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginScreen />} />
          <Route path={ROUTES.REGISTER} element={<RegisterScreen />} />

          {/* Protected Routes */}
          <Route element={<RequireAuth />}>
            <Route path={ROUTES.HOME} element={<MainLayout />} />
            
            {/* Settings Dashboard */}
            <Route path={ROUTES.SETTINGS} element={<SettingsLayout />}>
              <Route index element={<Navigate to={ROUTES.SETTINGS_INFO} replace />} />
              <Route path="info" element={<ProfilePage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="schedules" element={<SchedulesPage />} />
            </Route>
          </Route>

          {/* Catch all redirect to home (which will redirect to login if not auth) */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </ServerHealthCheck>
    </BrowserRouter>
  );
}

export default App;
