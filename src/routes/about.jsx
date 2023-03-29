import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export default function About() {

    const navigate = useNavigate();

    return (
        <>
            <div className="flex items-center justify-center sm:mx-48">
                About
            </div>
            <Link onClick={() => navigate(-1)}>
                <div className='absolute top-2 left-2 h-12 w-12'>
                    <img src='goback.svg' />
                </div>
            </Link>
        </>
    )
}