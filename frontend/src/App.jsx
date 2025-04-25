import { Route, Routes } from "react-router-dom";
import { LoginForm } from "./components/login-form";
import { SignUpForm } from "./components/signUp-form";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<h1>Welcome to Home page</h1>} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/sign-up" element={<SignUpForm />} />
      </Routes>
    </>
  );
}

export default App;
