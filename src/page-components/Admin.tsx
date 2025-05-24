import { useKeyboardAdminToggle } from "../hooks/appState";

export const Admin = ({ children }: { children: React.ReactNode }) => {
  useKeyboardAdminToggle();
  return (
    <>
      {/* <AdminNavBar /> */}
      <div className="p-2 md:p-10 min-h-screen">
        {children}
        {/* <SaveButton /> */}
      </div>
    </>
  );
};
