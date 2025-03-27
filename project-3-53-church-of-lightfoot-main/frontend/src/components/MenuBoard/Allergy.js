/**
 * Allergy Component
 * @description Displays a warning icon along with a list of common allergens for informational purposes.
 *
 * @component
 * 
 * @returns {React.JSX.Element} A React component displaying an allergen warning icon and a list of allergens.
 */
const Allergy = () => (
    <div className = "allergen"> 
        <img src = '/ImageFolder/warning_panda.png' className = 'allergy-image' alt = {'allergen warning'}></img>
        <div className="allergy-text">Allergens: sesame, soybeans, wheat, milk, eggs, peanuts, shellfish, treenuts</div>
    </div>
);

export default Allergy;