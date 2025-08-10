import banner481 from "../../assets/auth/banner481.webp";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen">
      <div className="w-1/2 container p-10 flex flex-col gap-18 justify-center">
        <div>
          <h1 className="text-primary-pressed font-medium text-4xl mb-5">
            Log In
          </h1>
          <p className="text-gray-400 font-medium text-xl">
            Use the unique ID and password provided by Byte Digital.
          </p>
        </div>

        <LoginForm />
      </div>
      <div className="w-1/2 relative  h-full">
        <img
          src={banner481}
          className="h-full w-full relative object-cover"
          alt=""
        />
        <div className="absolute px-15 top-0 gap-6 justify-end py-28 text-gray-100 inset-0 flex flex-col">
          <p className="text-xl font-medium">All in one place</p>
          <div className="bg-gradient-to-r from-black p-10 rounded-xl to-[#0D126C]">
            <p className="text-info-secondary font-medium text-4xl">
              Empowering Educators to Shape Young Minds.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#EA4335]" />
              Manage Lessons
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#FBBC05]" />
              Assign Tasks
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#34A853]" />
              Track Progress
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
