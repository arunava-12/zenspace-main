import React from "react";
import { Routes, Route, Navigate, BrowserRouter, useLocation } from "react-router-dom";
import { useStore } from "./store/useStore.ts";
import { AnimatePresence, motion } from "framer-motion";
import { SpeedInsights } from "@vercel/speed-insights/react";

import Layout from "./components/Layout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Projects from "./pages/Projects.tsx";
import ProjectDetails from "./pages/ProjectDetails.tsx";
import Tasks from "./pages/Tasks.tsx";
import Team from "./pages/Team.tsx";
import Settings from "./pages/Settings.tsx";
import Login from "./pages/Login.tsx";
import Landing from "./pages/Landing.tsx";
import JoinProject from "./pages/JoinProject.tsx";

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const store = useStore();
  const { isAuthenticated } = store;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* PUBLIC ROUTES */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <PageWrapper><Landing /></PageWrapper>}
        />

        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <PageWrapper><Login store={store} /></PageWrapper>
          }
        />

        {/* Invite link */}
        <Route path="/join/:token" element={<PageWrapper><JoinProject store={store} /></PageWrapper>} />

        {/* PROTECTED LAYOUT */}
        {isAuthenticated ? (
          <Route element={<Layout store={store} />}>
            <Route path="/dashboard" element={<PageWrapper><Dashboard store={store} /></PageWrapper>} />
            <Route path="/projects" element={<PageWrapper><Projects store={store} /></PageWrapper>} />
            <Route path="/projects/:id" element={<PageWrapper><ProjectDetails store={store} /></PageWrapper>} />
            <Route path="/tasks" element={<PageWrapper><Tasks store={store} /></PageWrapper>} />
            <Route path="/team" element={<PageWrapper><Team store={store} /></PageWrapper>} />
            <Route path="/settings" element={<PageWrapper><Settings store={store} /></PageWrapper>} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const store = useStore();
  const { bootstrapped } = store;

  if (!bootstrapped) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 animate-morph shadow-brand"></div>
          <div className="text-surface-500 font-bold tracking-widest uppercase text-[10px]">ZenSpace</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <SpeedInsights />
    </BrowserRouter>
  );
};

export default App;