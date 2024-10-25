const ConversationSkeleton = () => {
	return (
		<div className='flex flex-col gap-2 w-52 my-2 px-4'>
			<div className='flex gap-2 items-center'>
				<div className='skeleton w-10 h-10 rounded-full shrink-0'></div>
				<div className='flex flex-1 justify-between'>
					<div className='flex flex-col gap-1'>
						<div className='skeleton h-2 w-48 rounded-full'></div>
						<div className='skeleton h-2 w-32 rounded-full'></div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default ConversationSkeleton;
