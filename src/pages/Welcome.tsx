import { useEffect } from "react"
import logo from "../../public/logo.webp"
import { useNavigate } from "react-router-dom"

export default function Welcome() {
    const navigate = useNavigate();
    const isNew = localStorage.getItem("isNew");

    useEffect(() => {
        if (isNew) {
            const timer = setTimeout(() => {
                navigate('/onboarding');
            }, 5000)
            return () => clearTimeout(timer)
        } else {
            localStorage.setItem("isNew", "true");
            const timer = setTimeout(() => {
                navigate('/onboarding');
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [])

    return (
        <div className="relative bg-cream-200 w-full h-screen flex flex-col items-center justify-center">
            <div className="relative text-center">
                <img src={logo} className="size-76" />
                <span className="text-lg font-medium">나에게 맞는 색을 찾는 가장 쉬운 방법</span>
            </div>

            <div className="flex gap-2 absolute bottom-24">
                <div className="rounded-full bg-brown-200 size-2"></div>
                <div className="rounded-full bg-brown-400 size-2"></div>
                <div className="rounded-full bg-brown-200 size-2"></div>
            </div>
        </div>
    )
}