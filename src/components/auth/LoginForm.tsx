import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useAppDispatch } from "../../reducers/store";
import { login } from "../../reducers/auth.reducer";

type LoginFormInputs = {
  userId: string;
  password: string;
};

const STATIC_USER_ID = "user_8932xyz";
const STATIC_PASSWORD = "Str0ngP@ssw0rd!";

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const validateAndLogin = (id: string, pass: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const isValid = id === STATIC_USER_ID && pass === STATIC_PASSWORD;

      if (isValid) {
        dispatch(login());
        navigate("/");
      } else {
        setError("userId", {
          type: "manual",
          message: "Incorrect ID",
        });
        setError("password", {
          type: "manual",
          message: "Incorrect Password",
        });
        setValue("userId", "");
        setValue("password", "");
      }

      setIsSubmitting(false);
    }, 1000);
  };

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    validateAndLogin(data.userId, data.password);
  };

  const loginAsGuest = () => {
    validateAndLogin(STATIC_USER_ID, STATIC_PASSWORD);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-sm w-full space-y-5"
    >
      {/* Unique ID Field */}
      <div>
        <label
          htmlFor="id"
          className="block text-sm font-medium text-primary mb-1"
        >
          Unique ID
        </label>
        <input
          id="id"
          type="text"
          placeholder="Enter your provided ID"
          {...register("userId", { required: "Required" })}
          className={`w-full rounded-md px-4 py-2 border outline-none text-sm transition ${
            errors.userId
              ? "border-red-400 placeholder-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }`}
        />
        {errors.userId && (
          <p className="text-red-500 text-xs mt-1">{errors.userId.message}</p>
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
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register("password", { required: "Required" })}
          className={`w-full rounded-md px-4 py-2 border outline-none text-sm transition ${
            errors.password
              ? "border-red-400 placeholder-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }`}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-md transition"
        >
          {isSubmitting ? (
            <Loader className="animate-spin mx-auto" />
          ) : (
            "Log In"
          )}
        </button>

        <button
          type="button"
          onClick={loginAsGuest}
          disabled={isSubmitting}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold py-2 rounded-md transition"
        >
          {isSubmitting ? (
            <Loader className="animate-spin mx-auto" />
          ) : (
            "Login as Guest"
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
