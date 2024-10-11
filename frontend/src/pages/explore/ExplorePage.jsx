import { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { Link } from "react-router-dom";
import {useQueryClient, useQuery }from "@tanstack/react-query"

import SearchUserSkeleton from "../../components/skeletons/SearchUserSkeleton"

const ExplorePage = () => {
  const [search, setSearch] = useState("");
  const handleInputChange = (e) => {
    setSearch(e.target.value);
  };

  const queryClient = useQueryClient();
  const { data: searchedUsers, isLoading} = useQuery({
    queryKey: ["searchedUsers", search],
    queryFn: async () => {
      try {
		if (search.trim() === "") {
		return []; // Return empty array if search is empty
		}
        const response = await fetch(`/api/user/search?username=${search}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Something went wrong!");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
	retry: false,
  });

  useEffect(() => {
	queryClient.invalidateQueries("searchedUsers");
  }, [search]);

  if (searchedUsers?.length === 0) {
	return (
		<div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
			<div className="flex justify-center items-center pt-1">
				<label className="input border border-gray-700 flex justify-between items-center w-full rounded-full m-4">
					<input
					type="text"
					placeholder="Search"
					value={search}
					onChange={handleInputChange}
					/>
					<IoIosSearch className="w-5 h-5 text-gray-400" />
				</label>
			</div>
		</div>
	)
}

  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
      <div className="flex justify-center items-center pt-1">
        <label className="input border border-gray-700 flex justify-between items-center w-full rounded-full m-4">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={handleInputChange}
          />
          <IoIosSearch className="w-5 h-5 text-gray-400" />
        </label>
      </div>
      <div>
        {isLoading && (
          <>
            <SearchUserSkeleton />
            <SearchUserSkeleton />
            <SearchUserSkeleton />
            <SearchUserSkeleton />
          </>
        )}
        {!isLoading &&
          searchedUsers?.map((user) => (
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center justify-between gap-4"
              key={user._id}
            >
              <div className="flex gap-2 items-center px-6 py-1">
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img src={user.profileImg || "/avatar-placeholder.png"} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold tracking-tight truncate w-full">
                    {user.fullname}
                  </span>
                  <span className="text-sm text-slate-500">
                    @{user.username}
                  </span>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default ExplorePage;
