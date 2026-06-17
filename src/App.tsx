import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Activity } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import Collect from "@/pages/Collect";
import Verify from "@/pages/Verify";
import Archive from "@/pages/Archive";
import { useStore } from "@/store/useStore";

function BootScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-md bg-teal/10 ring-1 ring-teal/30">
        <Activity className="h-6 w-6 text-teal" />
        <span className="absolute inset-0 rounded-md ring-1 ring-teal/20 animate-ping" />
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-chalk">介入影像归档</div>
        <div className="mt-1 font-mono text-[11px] text-chalk-mute">
          正在初始化手术间与病例数据…
        </div>
      </div>
    </div>
  );
}

function Boot({ children }: { children: React.ReactNode }) {
  const ready = useStore((s) => s.ready);
  const init = useStore((s) => s.init);
  useEffect(() => {
    void init();
  }, [init]);
  if (!ready) return <BootScreen />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Boot>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/collect" element={<Collect />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="*" element={<Navigate to="/collect" replace />} />
          </Route>
        </Routes>
      </Boot>
    </BrowserRouter>
  );
}
