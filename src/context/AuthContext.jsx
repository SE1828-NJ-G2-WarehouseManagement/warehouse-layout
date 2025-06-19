// import { createContext, useEffect, useState } from "react";
// import UserService from "../services/userService";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// const AuthContext = createContext();
// const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const navigate = useNavigate();
//     const userService = new UserService();
//     useEffect(() => {
//         const storedUser = localStorage.getItem("user");
//         if (storedUser) {
//             try {
//                 const parsedUser = JSON.parse(storedUser);
//                 if (parsedUser && parsedUser.role) {
//                     setUser(parsedUser);
//                 } else {
//                     localStorage.removeItem("user");
//                     setUser(null);
//                 }
//             } catch {
//                 localStorage.removeItem("user");
//                 setUser(null);
//             }
//         } else {
//             setUser(null);
//         }
//         setLoading(false);
//     }, []);


//     const login = async ({ email, password }) => {
//         if (!email || !password) {
//             toast.error("Email and password are required.");
//             return;
//         }

//         try {
//             const { data, token } = await userService.login(email, password);
//             localStorage.setItem("user", JSON.stringify(data));
//             localStorage.setItem("access_token", JSON.stringify(token));
//             setUser(data);
//             toast.success("Login successful!");
//             navigate("/dashboard");
//             // eslint-disable-next-line no-unused-vars
//         } catch (error) {
//             toast.error("Login failed. Please check your email and password.");
//         }
//     };

//     const logout = () => {
//         localStorage.removeItem("user");
//         localStorage.removeItem("token");
//         setUser(null);
//         navigate("/login");
//     };

    


//     return (
//         <AuthContext.Provider value={{ login, logout, user, loading }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// export { AuthContext, AuthProvider };



// src/context/AuthContext.js HOẶC src/hooks/useAuth.js

import { createContext, useEffect, useState } from "react";
import UserService from "../services/userService"; // Import class UserService
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // TẠO INSTANCE CỦA UserService TẠI ĐÂY
    // Lý tưởng là tạo một lần và sử dụng lại.
    // Nếu bạn muốn nó là một phần của context value, hãy đảm bảo nó ổn định.
    // Cách an toàn nhất là tạo nó trong một useMemo hoặc bên ngoài component nếu không có state.
    // Nhưng vì nó không có state riêng, tạo ở đây là được.
    const userService = new UserService(); // <--- TẠO INSTANCE TẠI ĐÂY

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && parsedUser.role) {
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem("user");
                    setUser(null);
                }
            } catch {
                localStorage.removeItem("user");
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    const login = async ({ email, password }) => {
        try {
            // GỌI PHƯƠNG THỨC TRÊN INSTANCE ĐÃ TẠO
            const { data, token } = await userService.login(email, password); // SỬ DỤNG userService.login

            localStorage.setItem("user", JSON.stringify(data));
            localStorage.setItem("access_token", JSON.stringify(token));
            setUser(data);
            toast.success("Login successful!");
            navigate("/dashboard");
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Login failed. Please check your email and password.";
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        setUser(null);
        navigate("/login");
    };

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            // GỌI PHƯƠNG THỨC TRÊN INSTANCE ĐÃ TẠO
            const result = await userService.viewProfile(); // SỬ DỤNG userService.viewProfile
            if (result?.isSuccess && result.user) {
                setUser(result.user);
                localStorage.setItem("user", JSON.stringify(result.user));
                return { success: true, user: result.user };
            } else {
                toast.error(result?.message || "Failed to fetch profile. Please log in again.");
                logout();
                return { success: false, message: result?.message };
            }
        } catch (error) {
            toast.error(error.message || "Failed to fetch profile.");
            logout();
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updatedData) => {
        setLoading(true);
        try {
            // GỌI PHƯƠNG THỨC TRÊN INSTANCE ĐÃ TẠO
            const result = await userService.updateProfile(updatedData); // SỬ DỤNG userService.updateProfile
            if (result?.isSuccess && result.user) {
                setUser(result.user);
                localStorage.setItem("user", JSON.stringify(result.user));
                toast.success(result.message || "Profile updated successfully!");
                return { success: true, user: result.user };
            } else {
                toast.error(result?.message || "Failed to update profile.");
                return { success: false, message: result?.message };
            }
        } catch (error) {
            toast.error(error.message || "Failed to update profile.");
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ login, logout, user, loading, fetchUserProfile, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };