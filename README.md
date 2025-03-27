# Project 3: Point-of-Sale System

This repository contains the code for a point-of-sale (POS) system developed as part of a group project for a Software Engineering course at Texas A&M University. This project was built by myself and a team of developers using an Agile development methodology. I served as the Scrum Master, organizing sprints, facilitating meetings, and guiding the development process. We used **Jira** throughout the project to manage tasks, track progress, and maintain user stories.

## Tech Stack
- **PostgreSQL** (Required)
- **Express.js**
- **React.js**
- **Node.js**

While the only required technology was PostgreSQL, our team chose to implement a full PERN stack to enrich the functionality and responsiveness of the system.

## Key Features

### POS System Capabilities
- **Inventory Management**: Monitor and update inventory in real-time.
- **Checkout System**: Fully functional checkout interfaces for both cashier-operated and self-service kiosk systems.
- **Menu Board**: Displays all available items dynamically based on the inventory.

### Manager Portal
- Live monitoring of inventory levels
- User permission management (add/change roles)
- Update existing item prices and ingredients
- Add specialty ingredients

### Authentication & Security
- Integrated **OAuth** to securely verify user identities.

### Kitchen View
- Displays only kiosk-submitted orders
- Dynamically updates with new orders
- Alerts for orders taking over 5 minutes (flashing red)

### Kiosk View
- Customer-facing self-service interface for browsing and placing orders
- Interactive and user-friendly design
- Automatically routes orders to the kitchen view upon submission
- Connected with the loyalty system to apply and redeem points

### Additional Features
- **Loyalty System**: Tracks customer purchases and awards points for rewards.
- **Sales Reports**: Automatically generated reports for business insights
- **Item Demand Tracking**: Sort and visualize item popularity over custom date ranges with dynamic graphs
- **Managerial Tools**: Various administrative tools for analyzing performance, managing sales trends, and optimizing inventory
- Item details including **calories**, **allergen information**, and more
- Many other convenience features to streamline restaurant operations

---

This project reflects collaborative design, real-world development practices, and robust feature implementation using modern web technologies. Feel free to explore the code and reach out with any questions!
