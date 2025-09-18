import banner481 from "../../assets/auth/banner481.webp";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen">
      {/* Form Section */}
      <div className="w-full lg:w-1/2 container p-4 sm:p-6 lg:p-10 flex flex-col gap-8 lg:gap-18 justify-center min-h-screen lg:min-h-0">
        <div>
          <h1 className="text-primary-pressed font-medium text-2xl sm:text-3xl lg:text-4xl mb-3 lg:mb-5">
            Log In
          </h1>
          <p className="text-gray-400 font-medium text-lg sm:text-xl">
            Access your UCF admin portal with your Knights credentials.
          </p>
        </div>

        <LoginForm />
      </div>

      {/* Banner Section - Hidden on mobile, visible on large screens */}
      <div className="hidden lg:block lg:w-1/2 relative h-full">
        <img
          src={banner481}
          className="h-full w-full relative object-cover"
          alt="UCF Campus"
        />
        <div className="absolute px-8 xl:px-15 top-0 gap-4 xl:gap-6 justify-end py-16 xl:py-28 text-gray-100 inset-0 flex flex-col">
          <p className="text-lg xl:text-xl font-medium">UCF Community</p>
          <div className="bg-gradient-to-r from-black p-6 xl:p-10 rounded-xl to-[#0D126C]">
            <p className="text-info-secondary font-medium text-2xl xl:text-4xl">
              Charge On with Excellence and Innovation.
            </p>
          </div>
          <div className="flex gap-4 xl:gap-8">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#EA4335]" />
              <span className="text-sm xl:text-base">Farmer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#FBBC05]" />
              <span className="text-sm xl:text-base">Point of Sale</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#34A853]" />
              <span className="text-sm xl:text-base">Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Banner Section - Optional: Show a smaller version on mobile */}
      <div className="lg:hidden w-full h-32 sm:h-40 relative overflow-hidden">
        <img
          src={banner481}
          className="h-full w-full object-cover"
          alt="UCF Campus"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <p className="text-white font-medium text-lg sm:text-xl text-center px-4">
            UCF Community Portal
          </p>
        </div>
      </div>
    </div>
  );
}
