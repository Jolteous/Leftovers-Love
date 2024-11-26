import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
    const [values, setValues] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const { push } = useRouter();
    const { status } = useSession();

    useEffect(() => {
        if (status === "authenticated") push("/dashboard");
    }, [status]);

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setOpen(false);

        const response = await signIn("credentials", {
            redirect: false,
            email: values.email,
            password: values.password,
        });

        if (response?.error) {
            setError(response.error);
            alert(response.error);
        }

        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6">Leftovers Love</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Email
                        </label>
                        <div className="flex items-center border-b border-gray-300">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                className="w-full px-2 py-1 text-gray-700 focus:outline-none"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Password
                        </label>
                        <div className="flex items-center border-b border-gray-300">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                className="w-full px-2 py-1 text-gray-700 focus:outline-none"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className={`w-full bg-blue-600 text-white py-2 rounded-md ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>
                <div className="text-center mt-4">
                    <a
                        href="/forgot"
                        className="text-blue-600 hover:underline text-sm font-medium"
                    >
                        Forgot Password?
                    </a>
                </div>
            </div>
        </div>
    );
}