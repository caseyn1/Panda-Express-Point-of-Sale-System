import React, {useState, useEffect} from 'react';
import { executeGet } from "../../util/Requests";

/**
 * SeasonalAdder Component
 * @description A button to initiate the process of adding a new menu item and its ingredients.
 *
 * @component
 * @param {Object} props - React props for configuring the component.
 * @param {Function} props.onClick - Callback function to open the menu item and ingredient addition popup.
 * 
 * @returns {React.JSX.Element} A React component that renders a button to add a new menu item and its ingredients.
 */
export const SeasonalAdder = ({onClick}) => {
    // squared display that highlights the border when selected
    const buttonStyle = " bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 active:bg-red-700";
    return (
        <div className="rounded-lg p-4 mb-4">
                <button className= {"w-[100%] h-[100%] px-3 py-1 bg-red-500 text-white rounded-md" + buttonStyle} onClick={() => onClick(true)}>Add Menu Item and Ingredients</button>
        </div>
    );
}

/**
 * SeasonalAdderPopUp Component
 * @description A popup form to add a new menu item and its associated ingredients. Includes steps for ingredient addition and menu item configuration.
 *
 * @component
 * @param {Object} props - React props for configuring the component.
 * @param {Function} props.onClose - Callback function to close the popup.
 * @param {Function} props.onAdd - Callback function to add a new menu item.
 * @param {Function} props.onAddIng - Callback function to add a new ingredient.
 * @param {Array} props.items - Array of existing ingredients for selection in the menu item configuration.
 * 
 * @returns {React.JSX.Element} A React component that provides a multi-step form to add menu items and their ingredients.
 */
export const SeasonalAdderPopUp = ({onClose, onAdd, onAddIng, items}) => {
    //name, price, calories, protein, carbohydrate, saturated_fat, spicy, premium, allergens, ingredients, type
    const [name, setName] = useState("");
    const [price, setPrice] = useState("0.0");
    const [calories, setCalories] = useState("0");
    const [protein, setProtein] = useState("0.0");
    const [carbohydrate, setCarbohydrate] = useState("0.0");
    const [saturated_fat, setSaturated] = useState("0.0");
    const [spicy, setSpicy] = useState(false);
    const [premium, setPremium] = useState(false);
    const [allergens, setAllergens] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [type, setType] = useState("ENTREE");
    const [step, setStep] = useState(1);
    const [ingname, setIngname] = useState("");
    const [ingunit, setIngunit] = useState("oz");
    const [min, setMin] = useState("0.0");
    const [max, setMax] = useState("0.0");
    const [restock, setRestock] = useState(0.0);
    const [currprice, setCurrprice] = useState("0.0");
    const [stock, setStock] = useState("0.0");
    const [ingredientQuantities, setIngredientQuantities] = useState({});
    const [ingredientUnits, setIngredientUnits] = useState([]);



    /**
     * handleAdd
     * @description Handles adding a new menu item after validation. Resets the form and calls `onAdd`.
     */
    const handleAdd = () => {
        const parsedQuantities = Object.fromEntries(
            Object.entries(ingredientQuantities).map(([id, quantity]) => [
              id,
              parseFloat(quantity), // Convert to float on submission
            ])
          );
        if (!name.trim() || isNaN(price) || isNaN(calories) || isNaN(protein) || isNaN(saturated_fat) || isNaN(carbohydrate)) {
            alert("Try Again: information inputted incorrectly.");
            return;
        }
        
        if (allergens.includes("none") && allergens.length > 1) {
            setAllergens(allergens.filter((al) => al !== "none"));
        } 

        if (ingredients.includes("none") && ingredients.length > 1) {
            setIngredients(ingredients.filter((al) => al !== "none"));
        } 

        onAdd(name, parseFloat(price), parseInt(calories), parseFloat(saturated_fat), parseFloat(protein), parseFloat(carbohydrate), spicy, premium, ((allergens.filter((al)=> al !== "none")).join("_")).replace(/_/g,"_"), ingredients.filter((al)=> al !== "none"), type, parsedQuantities, ingredientUnits);
        setName(""); 
        setPrice("0.0"); 
        setCalories("0");
        setProtein("0.0");
        setCarbohydrate("0.0");
        setSaturated("0.0");
        setSpicy(false);
        setPremium(false);
        setAllergens(["none"]);
        setIngredients([]);
        setType("ENTREE");
        setIngredientQuantities({});
        setIngredientUnits([]);
        onClose(false);
    };

    /**
     * handleAddIng
     * @description Handles adding a new ingredient after validation. Resets the ingredient form and calls `onAddIng`.
     */
    const handleAddIng = () => {
        console.log(typeof ingname);
        if (!ingname.trim()) {
            alert("Ingredient name cannot be empty.");
            return;
        }
        console.log(typeof ingname.trim());
        onAddIng(ingname.trim(), parseFloat(stock), ingunit, parseFloat(min), parseFloat(max), parseFloat(restock), parseFloat(currprice));
        setIngname("");
        setIngunit("oz");
        setMin("0.0");
        setMax("0.0");
        setRestock(0.0);
        setCurrprice("0.0");
        setStock("0.0");
    }

    /**
     * handleReset
     * @description Resets the selected ingredients to the default value of `["none"]`.
     * 
     * @function
     * @param {Object} e - The event object triggered by the reset action (optional).
     * 
     * @returns {void}
     */
    const handleReset = (e) => {
        setIngredients([]);
    }
    
    /**
     * handleResetAllergens
     * @description Resets the selected allergens to the default value of `["none"]`.
     * 
     * @function
     * @param {Object} e - The event object triggered by the reset action (optional).
     * 
     * @returns {void}
     */
    const handleResetAllergens = (e) => {
        setAllergens([]);
    }

        /**
     * useEffect Hook
     * @description Calculates the restock quantity dynamically based on the min and max thresholds.
     */
    useEffect(() => {
        if (max && min && !isNaN(max) && !isNaN(min) && parseFloat(max) > parseFloat(min)) {
            setRestock((parseFloat(max) - parseFloat(min)).toFixed(2));
        } else {
            setRestock("0.0");
        }
    }, [max, min]);

    const handleIngredientChange = (e) => {
        const value = e.target.value;
      
        setIngredients((prev) =>
          prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
        );
      
        const matchingItem = items.find((item) => item.name === value);
        if (matchingItem) {
          const ingredientId = matchingItem.ingredient_id;
          const unit = matchingItem.unit || "Unknown";
      
          setIngredientUnits((prev) => {
            const updatedUnits = { ...prev };
            updatedUnits[ingredientId] = unit; 
            return updatedUnits;
          });
        }
      };
      
    
      const handleQuantityChange = (ingredientId, quantity) => {
        if (!/^\d*\.?\d*$/.test(quantity)) {
          return; 
        }
      
        setIngredientQuantities((prev) => ({
          ...prev,
          [ingredientId]: quantity, 
        }));
      };

    return (
        <div className="fixed top-[50%] left-[50%] w-[40%] translate-x-[-50%] translate-y-[-50%] p-[20px] bg-white rounded-md border border-gray-300">
            {step === 1 && (
                <div>
                    <h3 className='text-lg font-bold'>Add New Ingredients</h3>
                    <p className = 'text-sm mt-1 font-medium'>Submit one ingredient at a time.</p>
                    <div className="grid grid-cols-3 gap-[30px] mt-4">
                            <div className = "flex flex-col">
                                <p className = "w-[100px]">Ingredient:</p>
                                <input className="border" type="text" id="ingname" value = {ingname} onChange = {(e) => setIngname(e.target.value)}/>
                            </div>
                            <div className = "flex flex-col">
                                <p>Unit:</p>
                                <select value = {ingunit} className = "border w-[50px]" onChange ={(e) => setIngunit(e.target.value)}>
                                    <option value = "oz">oz</option>
                                    <option value = "cups">cups</option>
                                    <option value = "lbs">lbs</option>
                                    <option value = "tbsp">tbsp</option>
                                </select>    
                            </div>
                            <div className = "flex flex-col">
                                <p>Minimum Stock:</p>
                                <input className="border" type="text" id="min" value = {min} onChange = {(e) => setMin(e.target.value)}/>
                            </div>
                            <div className = "flex flex-col">
                                <p>Maximum Stock:</p>
                                <input className="border" type="text" id="max" value = {max} onChange = {(e) => setMax(e.target.value) && setStock(e.target.value)}/>
                            </div>
                            <div className = "flex flex-col">
                                <p>Restock quanitity:</p>
                                <p className = "border">{restock}</p>
                            </div>
                            <div className = "flex flex-col">
                                <p>Market Price:</p>
                                <input className="border" type="text" id="currprice" value = {currprice} onChange = {(e) => setCurrprice(e.target.value)}/>
                            </div>
                    </div>
                    <button className = "px-3 py-1 bg-red-500 text-white rounded-md mt-2" onClick = {handleAddIng}>Add</button>
                    <div className="flex justify-between mt-4">
                        <button className="px-3 py-1 bg-red-500 text-white rounded-md" onClick={() => onClose(false)}>Close</button>
                        <button className = 'px-3 py-1 bg-red-500 text-white rounded-md' onClick={(e) => setStep(2)}>Next</button>
                    </div>
                </div>
            )}
            {step === 2 && (
                <div>
                    <h4 className="text-lg font-bold">Add Menu Item and Select Ingredients</h4>
                    <div className = 'mt-0'>
                        <h5 className = "font-medium">Select Item Ingredients</h5>
                        <select multiple = {true} className = "border w-full p-2" value = {ingredients} 
                        onChange = {(e) => {handleIngredientChange(e)}}
                        >
                            {items.map((ingredient =>
                                <option key = {ingredient.ingredient_id} value = {ingredient.name} className = 'selected:bg-blue-100'>{(ingredient.name).replace(/_/g, " ")}</option>
                            ))}
                        </select>
                        <h5 className="mt-0 font-medium">Enter Quantities for Ingredients</h5>
                        <div className="grid grid-cols-4 gap-[30px] mt-4">
                        {ingredients.map((ingredient) => {
                            const matchingItem = items.find((item) => item.name === ingredient);
                            const ingredientUnit = matchingItem ? matchingItem.unit : "Unknown";
                            const ingredientId = matchingItem ? matchingItem.ingredient_id : null; // Ensure we use the correct ID

                            if (!ingredientId) {
                            return null; // Skip if no matching ingredient ID is found
                            }

                            return (
                            <div key={ingredientId} className="mt-2">
                                <label className="block font-medium">
                                {ingredient.replace(/_/g, " ")}
                                </label>
                                <input
                                type="text"
                                className="border w-full p-1"
                                placeholder={`${ingredientUnit}`}
                                value={ingredientQuantities[ingredientId] || ""} // Use ingredientId for state mapping
                                onChange={(e) => handleQuantityChange(ingredientId, e.target.value)} // Update state using ingredientId
                                />
                            </div>
                            );
                        })}
                        </div>
                        <p className = "text-md mt-1 bg-blue-100">Selected Ingredients: {ingredients.length > 0 ? ((ingredients.filter((ing) => ing !== "none")).join(", ")).replace(/_/g, " ") : "None"}</p>
                        <div className = "flex justify-between mt-1">
                            <button className = "px-3 py-1 text-sm bg-red-500 text-white rounded-md" onClick = {handleReset}>Reset List</button>
                        </div>
                    </div>
                    <div className = 'mt-4'>
                        <h5 className = "font-medium">Select Item Allergens</h5>
                        <select multiple = {true} className = "border w-full p-2" value = {ingredients} 
                        onChange = {(e) => {
                            const value = e.target.value;
                            setAllergens((prev) => {
                                return prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value];
                            });
                        }}>
                            <option>sesame</option>
                            <option>soybeans</option>
                            <option>wheat</option>
                            <option>milk</option>
                            <option>eggs</option>
                            <option>peanuts</option>
                            <option>shellfish</option>
                            <option>treenuts</option>
                        </select>
                        <p className = "text-md mt-2 bg-blue-100">Selected Allergens: {allergens.length > 0 ? ((allergens.filter((ing) => ing !== "none")).join(", ")).replace(/_/g, " ") : "None"}</p>
                        <div className = "flex justify-between mt-1">
                            <button className = "px-3 py-1 text-sm bg-red-500 text-white rounded-md" onClick = {handleResetAllergens}>Reset List</button>
                        </div>
                    </div>
                    <div className = "mt-2">
                        <h6 className = "font-medium">Enter Item Details</h6>
                        <div className="inline-flex mt-1">
                            <p className="w-[100px]">Name:</p>
                            <input className="border ml-4" type="text" id="firstName" value = {name} onChange = {(e) => setName(e.target.value)}/>
                        </div>
                        <div className="inline-flex mt-1">
                            <p className="w-[100px]">Price:</p>
                            <input className="border ml-4" type="text" id="price" value = {price} onChange = {(e) => setPrice(e.target.value)} />
                        </div>
                        <div className="inline-flex mt-1">
                            <p className="w-[100px] ml-0">Calories:</p>
                            <input className="border ml-4" type="text" id="calories" value = {calories} onChange = {(e) => setCalories(e.target.value)}/>
                        </div>
                        <div className="inline-flex mt-1">
                            <p className="w-[100px]">Protein:</p>
                            <input className="border ml-4" type="text" id="protein" value = {protein} onChange = {(e) => setProtein(e.target.value)}/>
                        </div>
                        <div className="inline-flex mt-1">
                            <p className="w-[100px]">Carbohydrates:</p>
                            <input className="border ml-4" type="text" id="carbohydrates" value = {carbohydrate} onChange = {(e) => setCarbohydrate(e.target.value)}/>
                        </div>
                        <div className="inline-flex mt-1">
                            <p className="w-[100px]">Sat. Fats:</p>
                            <input className="border ml-4" type="text" id="saturated fats" value = {saturated_fat} onChange = {(e) => setSaturated(e.target.value)}/>
                        </div>
                        <div className="flex justify-between mt-1">
                            <p className="w-[100px]">Premium:</p>
                            <select className="border" type="text" id="premium" value = {premium} onChange = {(e) => setPremium(e.target.value === "true")}>
                                <option value = "true">Yes</option>
                                <option value = "false">No</option>
                            </select>
                            <p className="w-[100px]">Spicy:</p>
                            <select className="border" type="text" id="spicy" value = {spicy} onChange = {(e) => setSpicy(e.target.value === "true")}>
                                <option value = "true">Yes</option>
                                <option value = "false">No</option>
                            </select>
                            <p className="w-[100px]">Item Type:</p>
                            <select className="border" type="text" id="type" value = {type} onChange = {(e) => setType(e.target.value)}>
                                <option value = "SPECIAL">Seasonal</option>
                                <option value = "ENTREE">Entree</option>
                                <option value = "APPETIZER">Appetizer</option>
                                <option value = "SIDE">Side</option>
                                <option value = "DRINK">Drink</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-between mt-4">
                        <button className="px-3 py-1 bg-red-500 text-white rounded-md" onClick={() => onClose(false)}>Close</button>
                        <button className="px-3 py-1 bg-red-500 text-white rounded-md" onClick={handleAdd}>Add</button>
                    </div>
                </div>
            )}
        </div> //ADD STEP 3 how much of each ingredient you want for the menu item
    );
}