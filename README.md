# Realtor Property Tracker

## Project Description
The **Realtor Property Tracker** is a web application designed to help potential buyers track properties they are interested in. Users can add new properties, mark properties as visited, and add comments to the listings. It also allows the deletion of properties no longer of interest.

## Features
- **Add Property**: Users can add a property with the name of the person looking to buy and the address of the property.
- **Edit Property**: Users can mark a property as visited and add comments.
- **Delete Property**: Users can remove properties they are no longer interested in.
- **Responsive UI**: The app is built with Bootstrap for responsive design, making it easy to use on different devices.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Backend**: FastAPI
- **Data Storage**: In-memory database (list)

## Installation and Setup

### Prerequisites
Make sure you have Python installed on your system. You will also need to set up a virtual environment for this project.

### Setting up the Project
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/Marcusb8441/TODO.git

2. Navigate to directory
    cd realtor-property-tracker

3. Create a virtual environment 
    python -m venv venv

4. Activate the VENV
    Windows- venv\Scripts\activate
    Mac- source venv/bin/activate

5. Install dependencies 
    pip install -r requirements.txt

### Running the App
1. Start the FastApi backend
     uvicorn main:app --reload

2. Open the index.html in the frontend folder

![App Demo](./demo.gif)




