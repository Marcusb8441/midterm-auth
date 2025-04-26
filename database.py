
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import User, Property

# My MongoDB connection string
connection_string = "mongodb+srv://marcusbodnar9:oe3VV3fza7x7Jc4H@cluster0.atrev8e.mongodb.net/"

async def init_db():
    # Connect to MongoDB using your connection string
    client = AsyncIOMotorClient(connection_string)
    
    # Explicitly specify database as 'login' based on your MongoDB Compass screenshot
    db = client.login
    
    # Initialize Beanie with the document models
    await init_beanie(
        database=db,
        document_models=[User, Property]
    )