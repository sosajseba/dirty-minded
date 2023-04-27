import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export default function NotFound() {

    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center p-6">
            <div className="h-452 w-298 rounded-2xl drop-shadow-xl p-10 bg-dirty-white md:ml-2 max-w-custom-2">
                <p className='text-left text-dirty-purple font-bold font-roboto text-xl'>No hemos encontrado lo que estas buscando.</p>
                <div className='absolute bottom-0 right-0'>
                    <img className='h-36' src="sad.png" />
                </div>
            </div>
            <Link onClick={() => navigate(-1)}>
                <div className='absolute top-2 left-2 h-12 w-12'>
                    <img src='goback.svg' />
                </div>
            </Link>
        </div>
    )
}