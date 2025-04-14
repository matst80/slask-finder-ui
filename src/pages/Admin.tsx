import { Outlet } from "react-router-dom";
import { useKeyboardAdminToggle } from "../hooks/appState";
import { AdminNavBar } from "./admin/AdminNavBar";

// export const SaveButton = () => {
//   const [loading, setLoading] = useState(false);
//   const save = () => {
//     setLoading(true);
//     fetch("/admin/save", { method: "POST" }).finally(() => setLoading(false));
//   };
//   return (
//     <div className="fixed bottom-0 right-0 p-4">
//       <button
//         disabled={loading}
//         className="bg-blue-500 text-white px-4 py-2 rounded-md"
//         onClick={save}
//       >
//         {loading ? (
//           <LoaderCircle className="size-4 animate-spin inline-block" />
//         ) : (
//           <span> Save changes </span>
//         )}
//       </button>
//     </div>
//   );
// };

export const Admin = () => {
  useKeyboardAdminToggle();
  return (
    <>
      <AdminNavBar />
      <div className="px-2 md:px-10 py-2 bg-gray-100 min-h-screen">
        <Outlet />
        {/* <SaveButton /> */}
      </div>
    </>
  );
};
