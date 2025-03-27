import React, { useEffect, useState } from 'react'; 

/**
 * A informational menu that displays the allergen list, spice level, wok smart status, and caloric infromation 
 * of a menu item 
 * 
 * @component
 * @param {Object} props - React props for configuring the item card.
 * @param {boolean} props.infoStatus - Boolean value that determines if info should display
 * @param {Object} props.item - Object menu item whose information will be displayed
 * @param {Function} props.closeInfo - Function to be called when close button is pressed
 * 
 * @returns {React.JSX.Element} A React component representing the information page of an item.
 */
export const KioskInfoLayout = ({infoStatus, item, closeInfo}) => {

    /**
   * Replaces all the "_" characters with ", "
   * @returns {String} - returns a parsed version of the allergenList provided for display
   */
    const parseAllergens = () => {
        let allergenList = item.allergens.replace(/_+/g, ", "); 
        //console.log("The allergies on the list are: ", allergenList); 
        return allergenList;
    }

    /**
   * Determines if an item is a wok smart item which is when the item's protein is above 8 and calories at most 300
   * @returns {boolean} - returns if the item is a wok smart item
   */
    const isWokSmart = () => {
        if(item.protein >= 8.0 && item.calories <= 300.0){
            return true;
        }else{
            return false;
        }
    }

    useEffect(() => {
        const handleEscape = (event) => {
          if (event.key === 'Escape') {
            closeInfo();
          }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }, [closeInfo]);
    return (
        <div className= {`${infoStatus === false ? 'hidden' : ''} fixed inset-0 bg-black/50 flex items-center justify-center z-50`} aria-modal="true">
            <div className="bg-amber-50 w-[30vw] h-[85vh] relative rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className = "w-full h-full flex flex-col">
                    {/*HEADER*/}
                    <div className='w-full h-[10%] bg-red-600 text-white text-semibold text-2xl 2xl:text-3xl 
                    flex items-center rounded-t-md justify-center'>
                        {item.name}
                        <button className = "absolute left-3 top-1 2xl:top-4 hover:text-black" onClick={() => closeInfo()}>
                            X
                        </button>
                    </div>

                    {/*BODY*/}
                    <div className='w-full h-[99%] overflow-y-auto flex flex-col mb-2 gap-y-5'>
                        <img src = {item.itemImage} alt = {item.name} className='w-full  border-b-2'/>
                        <div className={`${item.premium ? '': 'hidden'} w-full h-[20%] flex items-center justify-center bg-black`}>
                            <p className='text-yellow-300 font-semibold text-lg'>
                                PREMIUM +${item.price}
                            </p>
                        </div>
                        <div className={`${item.allergens === "None" ? 'hidden' : ''} h-[20%] flex items-center text-md 2xl:text-2xl `}>
                            <img src = '/ImageFolder/warning_panda.png' alt = "Allergies List" className=' w-[15%] h-auto object-contain'/>
                            <div className = "flex flex-col">
                                <p className='font-semibold'>Allergens</p>
                                <p>Contains: {parseAllergens()}</p>
                            </div>
                        </div>
                        <div className={`${!item.spicy ? 'hidden' : ''} h-[20%] flex items-center text-md 2xl:text-2xl`}>
                            <img src = '/ImageFolder/spicy_icon.png' alt = "This is spicy" className=' w-[15%] h-auto object-contain'/>
                            <div className = "flex flex-col">
                                <p className='font-semibold'>Spicy</p>
                                <p>This food has some heat to it. Think you can handle it?</p>
                            </div>
                        </div>
                        <div className={`${!isWokSmart() ? 'hidden' : ''} h-[20%] flex items-center text-md 2xl:text-2xl `}>
                            <img src = '/ImageFolder/wok_smart_icon.png' alt = "This item has at least 9 grams of protein and at most 300 calories" className=' w-[15%] h-auto object-contain'/>
                            <div className = "flex flex-col">
                                <p className='font-semibold'>Wok Smart</p>
                                <p>This item has at least 8g of protein and at most 300 calories</p>
                            </div>
                        </div>
                        <div className = "flex flex-col text-md 2xl:text-2xl w-[full] ml-2 mr-2">
                            <div className='font-semibold'>Nutritional Information</div>
                            <div className = "flex justify-between border-b">
                                <p>Calories:</p>
                                <p>{item.calories}Cal</p>
                            </div>
                            <div className = "flex justify-between border-b">
                                <p>Protein:</p>
                                <p>{item.protein}g</p>
                            </div>
                            <div className = "flex justify-between border-b">
                                <p>Carbohydrate:</p>
                                <p>{item.carbohydrate}g</p>
                            </div>
                            <div className = "flex justify-between">
                                <p>Saturated Fat:</p>
                                <p>{item.saturated_fat}g</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}; 