import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Loader, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useAppDispatch } from "../../reducers/store";
import { login } from "../../reducers/auth.reducer";
import { BASE_URL } from "../../utils/constants";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const loginUser = async (email: string, password: string) => {
    setIsSubmitting(true);
    clearErrors();

    try {
      const response = await axios.post(`${BASE_URL}api/admin/login`, {
        email,
        password,
      });

      // Assuming successful response contains user data or token
      if (response.data) {
        dispatch(login());
        navigate("/");
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.response?.status === 401) {
        setError("email", {
          type: "manual",
          message: "Invalid credentials",
        });
        setError("password", {
          type: "manual",
          message: "Invalid credentials",
        });
      } else if (error.response?.status === 400) {
        setError("email", {
          type: "manual",
          message: "Please check your email and password",
        });
      } else {
        setError("email", {
          type: "manual",
          message: "Login failed. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    loginUser(data.email, data.password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-sm w-full space-y-5"
    >
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-primary mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register("email", { 
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          })}
          className={`w-full rounded-md px-4 py-2 border outline-none text-sm transition ${
            errors.email
              ? "border-red-400 placeholder-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-primary mb-1"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password", { required: "Password is required" })}
            className={`w-full rounded-md px-4 py-2 pr-12 border outline-none text-sm transition ${
              errors.password
                ? "border-red-400 placeholder-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            }`}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2 rounded-md transition"
        >
          {isSubmitting ? (
            <Loader className="animate-spin mx-auto h-4 w-4" />
          ) : (
            "Log In"
          )}
        </button>
      </div>

      {/* Footer Links */}
      <div className="flex justify-between text-xs text-gray-400">
        <span className="cursor-not-allowed">Forgot Password?</span>
        <span className="cursor-not-allowed">Help</span>
      </div>
    </form>
  );
}
