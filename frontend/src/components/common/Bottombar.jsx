import { Link } from "react-router-dom";

import { AiFillHome } from "react-icons/ai";
import { IoNotifications } from "react-icons/io5";
import { FaUser, FaSearch } from "react-icons/fa";
import { AiFillMessage } from "react-icons/ai";
import { BiLogOut } from "react-icons/bi";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const BottomBar = () => {
  const queryClient = useQueryClient();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Something went wrong");
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  return (
    <div className="fixed bottom-0 left-0 w-full border-t border-gray-700 bg-black md:hidden z-50">
      <div className="flex justify-around items-center h-12 ">
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-white hover:bg-stone-900 p-2 rounded-full"
        >
          <AiFillHome className="w-5 h-5" />
        </Link>
        <Link 
          to="/explore"
          className="flex flex-col items-center justify-center text-white hover:bg-stone-900 p-2 rounded-full">
          <FaSearch className="w-4 h-4" />
        </Link>
        <Link to='/messages'
          className="flex flex-col items-center justify-center text-white hover:bg-stone-900 p-2 rounded-full">
          <AiFillMessage className="w-5 h-5" />
        </Link>
        <Link
          to="/notifications"
          className="flex flex-col items-center justify-center text-white hover:bg-stone-900 p-2 rounded-full"
        >
          <IoNotifications className="w-5 h-5" />
        </Link>
        <Link
          to={`/profile/${authUser?.username}`}
          className="flex flex-col items-center justify-center text-white hover:bg-stone-900 p-2 rounded-full"
        >
          <FaUser className="w-4 h-4" />
        </Link>
        {authUser && (
			<div className="flex flex-col items-center justify-center text-white hover:bg-stone-900 p-2 rounded-full">
				<BiLogOut
					className="w-5 h-5 cursor-pointer"
					onClick={(e) => {
					e.preventDefault();
					logout();
					}}
				/>
			</div>
        )}
      </div>
    </div>
  );
};

export default BottomBar;
