import banner481 from "../../assets/auth/banner481.webp";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen">
      {/* Mobile Background with Gradient */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-32 left-8 w-24 h-24 bg-purple-200 rounded-full opacity-25 blur-lg"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-indigo-200 rounded-full opacity-15 blur-2xl"></div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 container p-4 sm:p-6 lg:p-10 flex flex-col gap-8 lg:gap-18 justify-center min-h-screen lg:min-h-0 relative z-10">
        {/* Mobile Header with Enhanced Design */}
        <div className="lg:hidden text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-gray-800 font-bold text-3xl mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 font-medium text-lg">
            UCF Admin Portal
          </p>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
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
    </div>
  );
}
