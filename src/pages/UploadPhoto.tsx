import { MdAddAPhoto } from "react-icons/md";
import { IoIosInformationCircleOutline, IoIosCheckmarkCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";
import { FaRegImages } from "react-icons/fa6";

export default function UploadPhoto() {
    return (
        <div className="bg-cream w-full h-screen flex flex-col justify-center items-center">
            <header className="flex justify-center items-center h-16">
                <h1 className="text-xl text-brown-600">사진 등록</h1>
            </header>

            <main className="flex-1 flex flex-col gap-6 w-full max-w-97.5 pt-6">
                <div className="text-2xl text-brown-600">
                    <p>얼굴이 잘 보이는</p>
                    <p>사진을 올려주세요</p>
                    <p className="text-base mt-2 text-brown-400">정확한 진단을 위해 자연광에서 찍은 사진을 추천해요</p>
                </div>

                <section className="w-full h-80 border border-brown-600 border-dashed rounded-3xl bg-cream-100 flex flex-col items-center justify-center">
                    <input type="file" id="photoUpload" className="hidden" />

                    <label htmlFor="photoUpload" className="flex items-center justify-center cursor-pointer hover:bg-cream-300 size-24 bg-cream-200 rounded-full shadow-md">
                        <MdAddAPhoto className="size-9 text-brown-400" />
                    </label>

                    <div className="relative flex flex-col items-center top-6">
                        <span className="text-xl text-brown-600 mb-1">사진 촬영하기</span>
                        <span className="text-sm text-brown-400">앨범에서 선택하거나 새로 촬영하세요</span>
                    </div>
                </section>

                <section className="w-full h-56 rounded-3xl bg-white flex flex-col items-start p-6 gap-4 text-brown-600">
                    <p className="text-xl flex items-center justify-center"><IoIosInformationCircleOutline className="mr-2 size-4" /> 촬영 가이드</p>
                    <p className="text-sm flex items-center justify-center"><IoIosCheckmarkCircleOutline className="mr-2 size-4 text-green" />정면을 응시하고 있는 사진을 사용해주세요.</p>
                    <p className="text-sm flex items-center justify-center"><IoIosCloseCircleOutline className="mr-2 size-4 text-red" />너무 어두운 환경은 피해주세요.</p>
                    <p className="text-sm flex items-center justify-center"><IoIosCloseCircleOutline className="mr-2 size-4 text-red" />필터가 적용되지 않은 원본 사진이 좋습니다.</p>
                    <p className="text-sm flex items-center justify-center"><IoIosCloseCircleOutline className="mr-2 size-4 text-red" />마스크나 안경, 머리카락으로 얼굴을 가리지 마세요.</p>

                </section>

                <label htmlFor="photoUpload" className="cursor-pointer w-full bg-brown-600 flex items-center justify-center text-white text-xl py-4 rounded-full shadow-lg">
                    <FaRegImages className="mr-2 size-4 text-white" />사진 선택하기
                </label>
            </main>
        </div>
    )
}