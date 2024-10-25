import { useState } from "react";
import { Link } from "react-router-dom";

import Logo from "../../components/svgs/Logo";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const queryClient = useQueryClient();
  const {
    mutate: login,
    isError,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({ username, password }) => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Something went wrong");
        localStorage.setItem("user", JSON.stringify(data))
        console.log(data);
        return data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Logged in successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      window.location.reload();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
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
        <form className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col" onSubmit={handleSubmit}>
          <div className="flex items-center justify-center lg:hidden">
            <Logo className="w-24 lg:hidden fill-white" />
          </div>
          <h1 className="flex justify-center text-4xl font-extrabold text-white">{"Let's"} go.</h1>
          <div className="flex items-center justify-center text-white">
            <p className="text-sm font-semibold">
              Made with <span className="text-red-500">❤️</span> by{" "}
              <span className="text-blue-400">Gulam Gaush</span>
            </p>
          </div>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="text"
              className="grow"
              placeholder="username"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
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
            {isPending ? "Loading.. " : "Login"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
          <div className="flex flex-col gap-2 mt-4">
            <p className="text-white text-lg">{"Don't"} have an account?</p>
            <Link to="/signup">
              <button className="btn rounded-full btn-primary text-white btn-outline w-full">
                Sign up
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;
