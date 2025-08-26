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

interface LoginResponse {
  status: string;
  token: string;
  data: {
    admin: {
      id: string;
      name: string;
      email: string;
    };
  };
}

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
      const response = await axios.post<LoginResponse>(`${BASE_URL}api/admin/login`, {
        email,
        password,
      });

      if (response.data.status === "success" && response.data.token) {
        dispatch(login({
          token: response.data.token,
          user: response.data.data.admin,
        }));
        navigate("/");
      } else {
        setError("email", {
          type: "manual",
          message: "Login failed. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.response?.status === 401) {
        setError("email", {
          type: "manual",
          message: "Invalid email or password",
        });
        setError("password", {
          type: "manual",
          message: "Invalid email or password",
        });
      } else if (error.response?.status === 400) {
        setError("email", {
          type: "manual",
          message: "Please check your email and password",
        });
      } else if (error.response?.status === 500) {
        setError("email", {
          type: "manual",
          message: "Server error. Please try again later.",
        });
      } else if (error.code === "NETWORK_ERROR") {
        setError("email", {
          type: "manual",
          message: "Network error. Please check your connection.",
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
      role="form"
      aria-label="Login form"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-primary mb-1"
        >
          Email *
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          aria-describedby={errors.email ? "email-error" : undefined}
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
          <p id="email-error" className="text-red-500 text-xs mt-1" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-primary mb-1"
        >
          Password *
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            aria-describedby={errors.password ? "password-error" : undefined}
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
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-red-500 text-xs mt-1" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={isSubmitting ? "Signing in..." : "Sign in"}
        >
          {isSubmitting ? (
            <Loader className="animate-spin mx-auto h-4 w-4" />
          ) : (
            "Log In"
          )}
        </button>
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span className="cursor-not-allowed">Forgot Password?</span>
        <span className="cursor-not-allowed">Help</span>
      </div>
    </form>
  );
}
