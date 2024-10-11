import { Link } from "react-router-dom";
import {useQuery }from "@tanstack/react-query"

import SuggestionSkeleton from "../skeletons/SuggestionSkeleton"
import LoadingSpinner from "./LoadingSpinner"
import useFollow from "../../hooks/useFollow"

const RightPanel = () => {
	const {follow, isPending} = useFollow()
	const {data:suggestedUsers, isLoading} = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				const response = await fetch("/api/user/suggest", {
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
	})

	if(suggestedUsers?.length === 0){
		return <div className="md:w-64 w-0"></div>
	}

	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='border border-gray-700 p-4 rounded-md sticky top-2'>
				<p className='font-bold flex justify-start'>People You May Know</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<SuggestionSkeleton />
							<SuggestionSkeleton />
							<SuggestionSkeleton />
							<SuggestionSkeleton />
						</>
					)}
					{!isLoading &&
						suggestedUsers?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className='flex items-center justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.profileImg || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullname}
										</span>
										<span className='text-sm text-slate-500'>@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={(e) =>{ 
											e.preventDefault();
											follow(user._id);
										}}
									>
										{isPending ? <LoadingSpinner size="sm" /> : "Follow"}
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;