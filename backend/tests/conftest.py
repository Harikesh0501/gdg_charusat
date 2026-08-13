import pytest
from fastapi.testclient import TestClient
from app.main import app


from app.core.db import SessionLocal


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

