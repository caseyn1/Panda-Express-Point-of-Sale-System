import React from 'react';
/**
 * A Panda Express logo component
 * 
 * @component
 * @param {Object} props - React props for configuring the item card.
 * @param {String} props.width - String that defines the width dimension of logo
 * @param {String} props.height - String that defines the height dimension of logo
 * 
 * @returns {React.JSX.Element} A React component for the panda express logo
 */
export const Logo = ({width, height}) => {
    return (
        <img src = "../ImageFolder/Panda_logo.png" 
        alt = "Panda Express Logo" 
        className = {`${width} ${height} object-contain`}
        />
    );
}
