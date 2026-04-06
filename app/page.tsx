import AuthForm from "@/components/auth/AuthForm";


export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center">
      <AuthForm type="sign-in"/>
    </div>
  );
}
