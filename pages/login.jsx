import { SupabaseMagicLink, TWConstrainedCenteredContent } from "../components";

const LoginPage = () => {
  return (
    <TWConstrainedCenteredContent>
      <div className='py-24'>
        <h2 className='text-lg text-center font-semibold mb-6'>
          Magic Link Login
        </h2>
        <SupabaseMagicLink />
      </div>
    </TWConstrainedCenteredContent>
  )
}

export default LoginPage;