/* import { ThemeProvider } from '@gravity-ui/uikit'; */
import { ThemeProvider, Toaster, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';
import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Auth from './pages/Auth/Auth.tsx';
import BlockPage from './pages/Block/Block.tsx';
import Home from './pages/Home/Home';
import Live from './pages/Live/Live.tsx';
import Scenario from './pages/Scenario/Scenario';
import ScenarioCreate from './pages/ScenarioCreate/ScenarioCreate.tsx';
import { queryClient } from './services/queryClient';

const toaster = new Toaster();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme="light">
        <ToasterProvider toaster={toaster}>
          <Routes>
            {/* Маршруты без Layout */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/scenario/:id/live" element={<Live />} />

            {/* Маршруты для авторизованного пользователя */}
            {/* <Route element={<ProtectedRoute />}> */}
            {/* Маршруты с Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/scenario/:id" element={<Scenario />} />
              <Route path="/scenario/create" element={<ScenarioCreate />} />
              <Route path="/scenario/:id/block/:blockId" element={<BlockPage />} />
            </Route>
            {/* </Route> */}
          </Routes>
          <ToasterComponent />
        </ToasterProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
