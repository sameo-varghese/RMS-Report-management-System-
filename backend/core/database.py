import logging
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

logger = logging.getLogger("uvicorn.error")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    try:
        db_instance.client = AsyncIOMotorClient(settings.MONGODB_URI)
        db_instance.db = db_instance.client[settings.DB_NAME]
        
        # Ping server
        await db_instance.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB Atlas!")
        
        # Create text index on activities collection for keyword search (Business Rule #8)
        activities_col = db_instance.db.get_collection("activities")
        await activities_col.create_index(
            [("title", "text"), ("description", "text")],
            name="activity_text_search"
        )
        logger.info("MongoDB text indexes created successfully.")
    except Exception as e:
        logger.warning(f"MongoDB real connection failed: {e}. Switching to in-memory mock collection driver for seamless demo/testing mode.")
        db_instance.db = MockMongoDatabase()

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return db_instance.db

async def check_mongo_status() -> dict:
    """Returns detailed health status of MongoDB Atlas connection."""
    if db_instance.client is not None and not isinstance(db_instance.db, MockMongoDatabase):
        try:
            await db_instance.client.admin.command('ping')
            return {
                "status": "connected",
                "mode": "MongoDB Atlas Cluster",
                "uri_configured": True if settings.MONGODB_URI and "<username>" not in settings.MONGODB_URI else False,
                "message": "Connected to MongoDB Atlas live database."
            }
        except Exception as e:
            return {
                "status": "error",
                "mode": "MongoDB Atlas (Connection Error)",
                "uri_configured": True,
                "message": f"Connection error: {str(e)}"
            }
    return {
        "status": "mock",
        "mode": "In-Memory Mock Database",
        "uri_configured": True if settings.MONGODB_URI and "<username>" not in settings.MONGODB_URI else False,
        "message": "Running on in-memory mock driver (fill MONGODB_URI in backend/.env to connect live)."
    }



class MockMongoCollection:
    """In-memory MongoDB collection fallback when offline or MongoDB Atlas is not yet configured."""
    def __init__(self, name):
        self.name = name
        self.docs = []

    async def create_index(self, keys, name=None):
        pass

    async def insert_one(self, doc):
        from bson import ObjectId
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        self.docs.append(doc)
        class Result:
            inserted_id = doc["_id"]
        return Result()

    async def find_one(self, filter_dict):
        from bson import ObjectId
        for doc in self.docs:
            match = True
            for k, v in filter_dict.items():
                if k == "_id":
                    if str(doc.get("_id")) != str(v) and doc.get("_id") != v:
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def find(self, filter_dict=None):
        filter_dict = filter_dict or {}
        matching = []
        for doc in self.docs:
            match = True
            for k, v in filter_dict.items():
                if k == "$text":
                    search_term = v.get("$search", "").lower()
                    title = str(doc.get("title", "")).lower()
                    desc = str(doc.get("description", "")).lower()
                    if search_term not in title and search_term not in desc:
                        match = False
                        break
                elif k == "_id":
                    if isinstance(v, dict) and "$lt" in v:
                        if str(doc.get("_id")) >= str(v["$lt"]):
                            match = False
                            break
                    elif str(doc.get("_id")) != str(v) and doc.get("_id") != v:
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                matching.append(doc)
        
        class Cursor:
            def __init__(self, items):
                self.items = items
            def sort(self, key, direction=-1):
                self.items.sort(key=lambda x: x.get(key, ""), reverse=(direction == -1))
                return self
            def limit(self, count):
                self.items = self.items[:count]
                return self
            async def to_list(self, length=100):
                return self.items[:length]
        return Cursor(matching)

    async def update_one(self, filter_dict, update_dict):
        doc = await self.find_one(filter_dict)
        if doc and "$set" in update_dict:
            for k, v in update_dict["$set"].items():
                doc[k] = v
        class Result:
            modified_count = 1 if doc else 0
        return Result()

    async def delete_one(self, filter_dict):
        doc = await self.find_one(filter_dict)
        if doc:
            self.docs.remove(doc)
            class Result:
                deleted_count = 1
            return Result()
        class Result:
            deleted_count = 0
        return Result()

    async def delete_many(self, filter_dict):
        initial_len = len(self.docs)
        self.docs = [d for d in self.docs if not all(d.get(k) == v for k, v in filter_dict.items())]
        class Result:
            deleted_count = initial_len - len(self.docs)
        return Result()

    async def count_documents(self, filter_dict):
        cursor = self.find(filter_dict)
        items = await cursor.to_list(1000)
        return len(items)


class MockMongoDatabase:
    def __init__(self):
        self.collections = {}

    def get_collection(self, name):
        if name not in self.collections:
            self.collections[name] = MockMongoCollection(name)
        return self.collections[name]

    def __getitem__(self, name):
        return self.get_collection(name)
