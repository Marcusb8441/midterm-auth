from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import BaseModel, EmailStr

class User(Document):
    email: EmailStr
    hashed_password: str
    
    class Settings:
        name = "users"  # This will store users in the "users" collection

class Property(Document):
    user_id: str  # Reference to the User document
    name: str  # Name of the person
    address: str  # Property address
    visited: bool = False  # Whether the property has been visited
    comments: str = ""  # Any comments about the property
    timestamp: datetime = datetime.utcnow()  # When the property was added
    
    class Settings:
        name = "properties"  # This will store properties in the "properties" collection

# Pydantic models for request validation
class PropertyInput(BaseModel):
    name: str
    address: str
    visited: bool = False
    comments: str = ""

class UserAuth(BaseModel):
    email: EmailStr
    password: str