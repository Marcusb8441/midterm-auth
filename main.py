from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List
from datetime import datetime
from beanie import PydanticObjectId
from pydantic import EmailStr

from models import User, Property, PropertyInput
from database import init_db
from auth import hash_password, verify_password, create_access_token, decode_access_token

app = FastAPI()

# Mount static files which pointing to the static directory that contains main.js
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Database initialization on startup
@app.on_event("startup")
async def app_init():
    await init_db()

# Route to serve index.html from the frontend directory
@app.get("/")
async def serve_index():
    return FileResponse("frontend/index.html")

# Authentication dependency
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Auth endpoints
@app.post("/signup")
async def signup(user_data: dict = Body(...)):
    email = user_data.get("email")
    password = user_data.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
        
    # Check for existing user
    if await User.find_one(User.email == email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create and save user
    user = User(email=email, hashed_password=hash_password(password))
    await user.insert()
    
    return {"message": "User created successfully"}

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(User.email == form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

# Property endpoints
@app.post("/properties/")
async def create_property(property_input: PropertyInput, user: User = Depends(get_current_user)):
    # Create a new Property document
    property_doc = Property(
        user_id=str(user.id),
        name=property_input.name,
        address=property_input.address,
        visited=property_input.visited,
        comments=property_input.comments,
        timestamp=datetime.utcnow()
    )
    
    # Insert the document into MongoDB
    await property_doc.insert()
    
    # Return response
    return {"message": "Property added successfully", "property": property_doc}

@app.get("/properties/", response_model=List[Property])
async def get_properties(user: User = Depends(get_current_user)):
    return await Property.find(Property.user_id == str(user.id)).to_list()

@app.put("/properties/{property_id}")
async def update_property(property_id: str, property_input: PropertyInput, user: User = Depends(get_current_user)):
    property_doc = await Property.get(PydanticObjectId(property_id))
    
    if not property_doc or property_doc.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Update property fields
    property_doc.name = property_input.name
    property_doc.address = property_input.address
    property_doc.visited = property_input.visited
    property_doc.comments = property_input.comments
    
    await property_doc.save()
    return {"message": "Property updated", "property": property_doc}

@app.delete("/properties/{property_id}")
async def delete_property(property_id: str, user: User = Depends(get_current_user)):
    property_doc = await Property.get(PydanticObjectId(property_id))
    
    if not property_doc or property_doc.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Property not found")
    
    await property_doc.delete()
    return {"message": "Property deleted"}