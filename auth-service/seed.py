from app.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.user import User


Base.metadata.create_all(bind=engine)


users = [
    {
        "user_id": "COA-001",
        "department": "COA",
        "name": "COA Officer",
        "password": "coa123",
        "role": "COA_USER",
    },
    {
        "user_id": "ENG-001",
        "department": "ENGINEERING",
        "name": "Engineering Officer",
        "password": "eng123",
        "role": "ENGINEER",
    },
    {
        "user_id": "TRA-001",
        "department": "TMS",
        "name": "TMS Officer",
        "password": "tra123",
        "role": "TMS_USER",
    },
    {
        "user_id": "SNT-001",
        "department": "SMMS",
        "name": "SMMS Officer",
        "password": "snt123",
        "role": "SMMS_USER",
    },
]


def seed_users():
    db = SessionLocal()

    try:
        for user_data in users:
            existing_user = (
                db.query(User)
                .filter(User.user_id == user_data["user_id"])
                .first()
            )

            if existing_user:
                print(f"{user_data['user_id']} already exists")
                continue

            user = User(
                user_id=user_data["user_id"],
                department=user_data["department"],
                name=user_data["name"],
                password_hash=hash_password(user_data["password"]),
                role=user_data["role"],
            )

            db.add(user)
            print(f"Created {user_data['user_id']}")

        db.commit()

    finally:
        db.close()


if __name__ == "__main__":
    seed_users()