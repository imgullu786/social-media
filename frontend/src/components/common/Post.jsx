import { FaRegComment } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/dateFormat";

const Post = ({ post }) => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  // deletePost react-query mutation
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`/api/post/${post._id}`, {
          method: "DELETE",
        });
        const data = response.json();
        if (data.error) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // likeUnlikePost react-query mutation
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`/api/post/like/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = response.json();
        if (data.error) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (updatedLikes) => {
      // if (isLiked) {
      //   toast.success("Post unliked successfully");
      // } else {
      //   toast.success("Post liked successfully");
      // }
      // refreshing all posts if bad idea, we can just update the only post that was liked in like unlike controllers at backend then setQueryData here
      queryClient.setQueryData(["posts"], (oldPosts) => {
        return oldPosts.map((oldPost) => {
          if (oldPost._id === post._id) {
            return {
              ...oldPost,
              likes: updatedLikes,
            };
          }
          return oldPost;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // commentPost react-query mutation
  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async (comment) => {
      try {
        const response = await fetch(`/api/post/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        });
        const data = response.json();
        if (data.error) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (posts) => {
      setComment("");
      // toast.success("Comment posted successfully");
      // queryClient.invalidateQueries({queryKey: ['posts']});
      // refreshing all posts if bad idea, we can just update the only post that was commented bt setQueryData
      queryClient.setQueryData(["posts"], (oldPosts) => {
        return oldPosts.map((oldPost) => {
          if (oldPost._id === post._id) {
            return {
              ...oldPost,
              comments: [
                ...oldPost.comments,
                { text: comment, postedBy: authUser },
              ],
            };
          }
          return oldPost;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const postOwner = post.userId;
  const isLiked = authUser._id === post.likes.find((id) => id === authUser._id);
  const isMyPost = authUser._id === postOwner._id;

  const formattedDate = formatPostDate(post.createdAt);

  const handleDeletePost = () => {
    deletePost();
  };

  const [comment, setComment] = useState("");
  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    commentPost(comment);
  };

  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
  };

  return (
    <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <Link
          to={`/profile/${postOwner.username}`}
          className="w-8 h-8 rounded-full overflow-hidden"
        >
          <div className="avatar -z-10">
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
          </div>
        </Link>
      <div className="flex flex-col flex-1">
        <div className="flex gap-2 items-center">
          <Link to={`/profile/${postOwner.username}`} className="font-bold">
            {postOwner.fullname}
          </Link>
          <span className="text-gray-700 flex gap-1 text-sm">
            <Link to={`/profile/${postOwner.username}`}>
              @{postOwner.username}
            </Link>
            <span>·</span>
            <span>{formattedDate}</span>
          </span>
          {isMyPost && (
            <span className="flex justify-end flex-1">
              {!isDeleting && (
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={handleDeletePost}
                />
              )}
              {isDeleting && <LoadingSpinner size="sm" />}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 overflow-hidden">
          <span className="flex justify-start">{post.text}</span>
          {post.img && (
            <img
              src={post.img}
              className="h-80 object-contain rounded-lg border border-gray-700"
              alt=""
            />
          )}
        </div>
        <div className="flex justify-between mt-3">
          <div className="flex gap-4 w-1/5 items-center justify-between">
            <div
              className="flex gap-1 items-center group cursor-pointer"
              onClick={handleLikePost}
            >
              {isLiking && <LoadingSpinner size="sm" />}
              {!isLiked && !isLiking && (
                <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
              )}
              {isLiked && !isLiking && (
                <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
              )}

              <span
                className={`text-sm group-hover:text-pink-500 ${
                  isLiked ? "text-pink-500" : " text-slate-500"
                }`}
              >
                {post.likes.length}
              </span>
            </div>
            <div
              className="flex gap-1 items-center cursor-pointer group"
              onClick={() =>
                document
                  .getElementById("comments_modal" + post._id)
                  .showModal()
              }
            >
              <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
              <span className="text-sm text-slate-500 group-hover:text-sky-400">
                {post.comments.length}
              </span>
            </div>
            {/* We're using Modal Component from DaisyUI */}
            <dialog
              id={`comments_modal${post._id}`}
              className="modal border-none outline-none"
            >
              <div className="modal-box rounded border border-gray-600">
                <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    ✕
                  </button>
                </form>
                <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                  {post.comments.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No comments Found, Be the first one to comment 👻
                    </p>
                  )}
                  {post.comments.map((comment) => (
                    <div key={comment._id} className="flex gap-2 items-start">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img
                            src={
                              comment.postedBy.profileImg ||
                              "/avatar-placeholder.png"
                            }
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">
                            {comment.postedBy.fullname}
                          </span>
                          <span className="text-gray-700 text-sm">
                            @{comment.postedBy.username}
                          </span>
                        </div>
                        <div className="text-sm flex justify-start">
                          {comment.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                  onSubmit={handlePostComment}
                >
                  <textarea
                    className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                    {isCommenting ? (
                      <span className="loading loading-spinner loading-md"></span>
                    ) : (
                      "Post"
                    )}
                  </button>
                </form>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button className="outline-none">close</button>
              </form>
            </dialog>
          </div>
          <div className="flex w-1/3 justify-end gap-2 items-center">
            <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Post;
