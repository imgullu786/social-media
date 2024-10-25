import { Link } from "react-router-dom";
import { useState } from "react";

import Logo from "../../components/svgs/Logo";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "react-hot-toast";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullname: "",
    password: "",
  });
  const queryClient = useQueryClient();
  const {
    mutate: signup,
    isError,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({ email, username, fullname, password }) => {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username, fullname, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Something went wrong");
        localStorage.setItem("user", JSON.stringify(data))
        console.log(data);
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      window.location.reload();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center justify-center">
      <Logo className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-center lg:hidden">
            <Logo className="w-24 lg:hidden fill-white" />
          </div>
          <h1 className="flex justify-center text-4xl font-extrabold text-white">Join today.</h1>
          <div class="flex items-center justify-center text-white">
            <p class="text-sm font-semibold">
              Made with <span class="text-red-500">❤️</span> by{" "}
              <span class="text-blue-400">Gulam Gaush</span>
            </p>
          </div>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2">
            <FaUser />
            <input
              type="text"
              className="grow "
              placeholder="Username"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdDriveFileRenameOutline />
            <input
              type="text"
              className="grow"
              placeholder="Full Name"
              name="fullname"
              onChange={handleInputChange}
              value={formData.fullname}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <button className="btn rounded-full btn-primary text-white">
            {isPending ? "Loading..." : "Sign Up"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
          <div className="flex flex-col gap-2 mt-4">
            <p className="text-white text-lg">Already have an account?</p>
            <Link to="/login">
              <button className="btn rounded-full btn-primary text-white btn-outline w-full">
                Sign In
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default SignUpPage;
