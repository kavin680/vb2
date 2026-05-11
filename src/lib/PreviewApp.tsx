import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from '../app/store/store';
import { PreviewContent } from './PreviewZone';
import { LoginScreen } from '../features/auth/components/LoginScreen';
import { RegisterScreen } from '../features/auth/components/RegisterScreen';
import { ROUTES } from '../shared/constants/routes';

export interface PreviewAppProps {
    jsonUrl?: string;
    isStandalone?: boolean;
}

import { ServerHealthCheck } from './ServerHealthCheck';

export function PreviewApp({ jsonUrl = "/items.json", isStandalone = false }: PreviewAppProps) {
    return (
        <Provider store={store}>
            <ServerHealthCheck isStandalone={isStandalone}>
                <BrowserRouter>
                    <Routes>
                        <Route path={ROUTES.LOGIN} element={<LoginScreen />} />
                        <Route path={ROUTES.REGISTER} element={<RegisterScreen />} />
                        <Route path="*" element={<PreviewContent jsonUrl={jsonUrl} isStandalone={isStandalone} />} />
                    </Routes>
                </BrowserRouter>
            </ServerHealthCheck>
        </Provider>
    );
}
