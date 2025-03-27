import { Logo } from '../../components/Kiosk/Logo';
import { Link } from "react-router-dom";

/**
 * Start order screen route
 * @param {Object} props - React props.
 * @returns {React.JSX.Element} A React component.
 */
export const KioskStart = () => {
    const backgroundStyle = {
        height: '100vh',
        backgroundColor: '#dc2626', 
        width: '100vw', 
    };

    const foregroundStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'white', 
        height: '100%',
        width: '100%',
        fontFamily: 'sans-serif',
    };
    const startOrderStyle = {
        backgroundColor: '#FFFFFF', 
        width: '50%', 
        height: '10%', 
        color: '#000000',
        fontSize: '2vw',
        fontWeight: 'bold',
    };

    return(
        <div className = "flex items-center justify-center h-screen">
            <div style = {backgroundStyle}>
                <div style = {foregroundStyle}>
                    <Logo width = "w-[30%]" height = "h-[50%]"></Logo>
                    <p style = {{fontSize: '5vw'}}>Welcome to</p>
                    <p style = {{fontSize: '5vw', fontWeight: 'bold'}}>Panda Express</p>
                    <Link style = {startOrderStyle} className = "flex items-center justify-center rounded-md" to ='/kioskOrder'>
                    Start Order Here
                    </Link>
                </div>
            </div>
        </div>
    );

};
